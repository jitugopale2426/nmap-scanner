import { exec } from 'child_process';
import { parseStringPromise } from 'xml2js';
import ScanJob from '../models/ScanJob.js';
import Host from '../models/Host.js';
import { startScanSchema } from '../validations/scanValidation.js';
import AppError from '../utils/AppError.js';
import { ErrorCodes } from '../constants/errorCodes.js';

const NMAP_PATH = process.env.NMAP_PATH || 'nmap';

export const startScan = async (req, res, next) => {
  try {
    const parsed = startScanSchema.safeParse(req.body);

    if (!parsed.success) {
      const fieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path?.[0];
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errorCode: ErrorCodes.SCAN_VALIDATION_FAILED,
        errors: fieldErrors
      });
    }

    const { target } = parsed.data;

    const job = await ScanJob.create({ target, status: 'running' });

    // fire nmap in the background — client polls for results via GET /scans/:id
    runNmap(job._id, target);

    res.status(201).json({ jobId: job._id, status: 'running' });
  } catch (err) {
    next(new AppError('Failed to start scan', 500, ErrorCodes.SCAN_START_FAILED));
  }
};

export const getScans = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // run both queries in parallel — no point waiting on count before fetching docs
    const [jobs, total] = await Promise.all([
      ScanJob.find(filter).sort({ startedAt: -1 }).skip(skip).limit(parseInt(limit)),
      ScanJob.countDocuments(filter)
    ]);

    res.json({
      data: jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getScanById = async (req, res, next) => {
  try {
    const job = await ScanJob.findById(req.params.id);
    if (!job) throw new AppError('Scan not found', 404, ErrorCodes.SCAN_NOT_FOUND);

    const hosts = await Host.find({ scanJobId: job._id });
    res.json({ job, hosts });
  } catch (err) {
    next(err);
  }
};

export const getScanStats = async (req, res, next) => {
  try {
    const [totalScans, statusCounts, totalHosts, portStats] = await Promise.all([
      ScanJob.countDocuments(),
      ScanJob.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Host.countDocuments(),
      Host.aggregate([
        { $project: { portCount: { $size: '$ports' } } },
        { $group: { _id: null, total: { $sum: '$portCount' } } }
      ])
    ]);

    const byStatus = statusCounts.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});

    res.json({
      totalScans,
      totalHosts,
      totalOpenPorts: portStats[0]?.total || 0,
      byStatus
    });
  } catch (err) {
    next(err);
  }
};

export const deleteScan = async (req, res, next) => {
  try {
    const job = await ScanJob.findById(req.params.id);
    if (!job) throw new AppError('Scan not found', 404, ErrorCodes.SCAN_NOT_FOUND);

    // clean up hosts too — don't leave orphaned documents
    await Host.deleteMany({ scanJobId: job._id });
    await job.deleteOne();

    res.json({ success: true, message: 'Scan deleted' });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError('Failed to delete scan', 500, ErrorCodes.SCAN_DELETE_FAILED));
  }
};

// ─── nmap execution ───────────────────────────────────────────────────────────

const runNmap = (jobId, target) => {
  // -sV: probe open ports to detect service/version
  // -T4: aggressive timing (faster on local networks)
  // --open: only show open ports, skip filtered/closed noise
  // -Pn: skip host discovery, treat all hosts as online (required on Windows without admin)
  // -oX -: output XML to stdout so we can parse it directly
  const cmd = `"${NMAP_PATH}" -sV -T4 --open -Pn -oX - ${target}`;

  exec(cmd, { timeout: 300000 }, async (err, stdout) => {
    // nmap exits with code 1 when no hosts found — stdout still has valid XML
    // only treat as real failure if there's no output at all
    if (err && !stdout?.trim()) {
      await ScanJob.findByIdAndUpdate(jobId, {
        status: 'failed',
        error: err.message,
        completedAt: new Date()
      });
      return;
    }

    try {
      const xmlResult = await parseStringPromise(stdout, { explicitArray: false });
      const rawHosts = xmlResult.nmaprun?.host ?? [];

      // nmap returns an object when there's one host, array for multiple
      const hostList = Array.isArray(rawHosts) ? rawHosts : [rawHosts];

      const hostDocs = hostList.map(host => {
        // address can be a single object or array (when both ipv4 + mac present)
        const ip = Array.isArray(host.address)
          ? host.address.find(a => a.$.addrtype === 'ipv4')?.$.addr
          : host.address?.$.addr;

        const hostname = host.hostnames?.hostname?.$.name ?? null;
        const status = host.status?.$.state ?? 'unknown';

        let ports = [];
        if (host.ports?.port) {
          const portList = Array.isArray(host.ports.port)
            ? host.ports.port
            : [host.ports.port];

          ports = portList.map(p => ({
            port: parseInt(p.$.portid),
            protocol: p.$.protocol,
            state: p.state?.$.state ?? 'unknown',
            service: p.service?.$.name ?? ''
          }));
        }

        return { scanJobId: jobId, ip, hostname, status, ports };
      });

      if (hostDocs.length) await Host.insertMany(hostDocs);

      await ScanJob.findByIdAndUpdate(jobId, {
        status: 'completed',
        completedAt: new Date()
      });
    } catch (parseErr) {
      await ScanJob.findByIdAndUpdate(jobId, {
        status: 'failed',
        error: 'Failed to parse nmap output',
        completedAt: new Date()
      });
    }
  });
};
