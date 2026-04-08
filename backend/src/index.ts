import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { ticketRouter } from './routes/ticket';
import { accountRouter } from './routes/account';
import { stripeRouter } from './routes/stripe';
import { debugRouter } from './routes/debug';
import { jiraRouter } from './routes/jira';
import { authRouter } from './routes/auth';
import { analyzeRouter } from './routes/analyze';
import { docsRouter } from './routes/docs';
import { certificationsRouter } from './routes/certifications';
import { autoBugFixRouter } from './routes/autoBugFix';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  credentials: true,
}));
app.use(express.json());

app.use('/api/ticket', ticketRouter);
app.use('/api/account', accountRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/debug', debugRouter);
app.use('/api/jira', jiraRouter);
app.use('/api/auth', authRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/docs', docsRouter);
app.use('/api/certifications', certificationsRouter);
app.use('/api/jira/auto-fix', autoBugFixRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

const MONGODB_URI = process.env.MONGODB_URI;

function startServer() {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('MongoDB connected');
      startServer();
    })
    .catch((err) => {
      console.warn(`MongoDB connection failed: ${err.message}`);
      console.warn('Starting server without database — DB-dependent routes will fail');
      startServer();
    });
} else {
  console.warn('MONGODB_URI not set — starting without database');
  startServer();
}
