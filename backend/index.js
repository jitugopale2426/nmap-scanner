import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';
import rootRouter from './src/routes/index.js';
import errorHandler from './src/middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', rootRouter);

app.get('/', (req, res) => res.json({ message: 'nmap-scanner API running' }));

// 404 for unknown routes
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// global error handler — must be last
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
