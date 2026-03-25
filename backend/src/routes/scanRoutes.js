import { Router } from 'express';
import { startScan, getScans, getScanById, deleteScan, getScanStats } from '../controllers/scanController.js';

const scannerRouter = Router();

scannerRouter.post('/scan', startScan);
scannerRouter.get('/scans', getScans);
scannerRouter.get('/scans/stats', getScanStats);
scannerRouter.get('/scans/:id', getScanById);
scannerRouter.delete('/scans/:id', deleteScan);

export default scannerRouter;
