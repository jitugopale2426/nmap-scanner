import { Router } from 'express';
import scannerRouter from './scanRoutes.js';

const rootRouter = Router();

rootRouter.use('/scanner', scannerRouter);

export default rootRouter;
