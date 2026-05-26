import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import authRouter from './routes/auth';
import syncRouter from './routes/sync';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '2mb' }));
app.use(cors({
  origin: isProd ? false : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

app.use('/api/auth', authRouter);
app.use('/api/sync', syncRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Serve Vite build in production
// __dirname resolves to packages/server/dist/ (compiled) or packages/server/src/ (tsx dev)
// Both are 2 levels up from packages/frontend/dist/
if (isProd) {
  const distDir = process.env.FRONTEND_DIST ?? path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
});
