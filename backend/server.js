const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Route imports
const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const faultRoutes = require('./routes/faultRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Centralized Railway Signaling Monitoring Platform API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/faults', faultRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Serve static frontend build in production
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (process.env.NODE_ENV === 'production' || fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect Database & Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Check if database is empty and auto-seed if needed
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('⚡ Empty database detected. Auto-populating sample dataset...');
      const { seedDatabase } = require('./utils/seedData');
      await seedDatabase(false);
    }

    app.listen(PORT, () => {
      console.log(`🚆 Railway Monitoring Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
};

startServer();
