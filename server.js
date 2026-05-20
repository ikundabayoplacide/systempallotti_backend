require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./src/config/env');
const { connectDB } = require('./src/config/database');
const logger = require('./src/utils/logger');
const { errorHandler, notFound } = require('./src/middlewares/error.middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

// Register model associations before routes are loaded
require('./src/database/models/associations');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const customerRoutes = require('./src/routes/customer.routes');
const productRoutes = require('./src/routes/product.routes');
const departmentRoutes = require('./src/routes/department.routes');
const jobRoutes = require('./src/routes/job.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const paymentRoutes = require('./src/routes/payment.routes');

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (only in non-production)
if (env.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: env.nodeEnv });
});

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Printing House API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const start = async () => {
  await connectDB();
  app.listen(env.port, () => {
    logger.info(`Server running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
    logger.info(`API Docs available at http://localhost:${env.port}/api-docs`);
  });
};

start();
