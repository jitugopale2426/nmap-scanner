import mongoose from 'mongoose';

// embedded sub-doc — no separate collection needed for ports
const portSchema = new mongoose.Schema(
  {
    port: Number,
    protocol: String, // tcp / udp
    state: String,    // open / filtered
    service: String   // http, ssh, etc.
  },
  { _id: false }
);

const hostSchema = new mongoose.Schema(
  {
    scanJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScanJob', required: true },
    ip: { type: String, required: true },
    hostname: { type: String, default: null },
    status: { type: String, default: 'unknown' }, // up / down
    ports: [portSchema],
    scannedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// scanJobId is always used in queries — index it
hostSchema.index({ scanJobId: 1 });

export default mongoose.model('Host', hostSchema);
