import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database';
import { participantsRouter } from './routes/participants';
import { templatesRouter } from './routes/templates';
import { trainingsRouter } from './routes/trainings';
import { certificatesRouter } from './routes/certificates';
import { emailRouter } from './routes/email';
import { authRouter } from './routes/auth';
import { apiLimiter, authLimiter, errorHandler, requestLogger, corsOptions } from './middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/participants', participantsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/trainings', trainingsRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/email', emailRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Welcome endpoint with logging
app.get('/api/welcome', (req, res) => {
  // Log request metadata
  console.log(`Request received: ${req.method} ${req.path} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`);

  res.json({ message: 'Welcome to the API Service!' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();