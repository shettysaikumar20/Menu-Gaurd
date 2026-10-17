import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import menuRoutes from './routes/menuRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { updateFinding } from './controllers/auditController.js';
import { storageService } from './services/storageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from current directory, server/, or root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  const storageStatus = storageService.getStorageStatus();
  res.json({
    status: 'healthy',
    app: 'MenuGuard AI Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    storage: storageStatus,
    backboardConfigured: Boolean(process.env.BACKBOARD_API_KEY && !process.env.BACKBOARD_API_KEY.startsWith('your_'))
  });
});

// Primary API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/audits', auditRoutes);

// Direct finding update route as recommended in spec: PATCH /api/findings/:id
app.patch('/api/findings/:id', updateFinding);

// Serve static frontend in production if client/dist exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.url} not found` });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Initialize storage and start server
async function start() {
  await storageService.init();
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`MenuGuard AI Server running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}

// Start only when executed directly
if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;
