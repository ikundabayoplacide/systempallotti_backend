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

// Register cron jobs
require('./src/utils/leaveCron');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const customerRoutes = require('./src/routes/customer.routes');
const productRoutes = require('./src/routes/product.routes');
const departmentRoutes = require('./src/routes/department.routes');
const jobRoutes = require('./src/routes/job.routes');
const visitRoutes = require('./src/routes/visit.routes');
const permissionRoutes = require('./src/routes/permission.routes');
const roleRoutes = require('./src/routes/role.routes');
const proformaRoutes = require('./src/routes/proforma.routes');
const jobItemRoutes = require('./src/routes/jobItem.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const boutiqueRoutes = require('./src/routes/boutique.routes');
const stockRoutes = require('./src/routes/stock.routes');
const invoiceRoutes = require('./src/routes/invoice.routes');
const jobAssignmentRoutes = require('./src/routes/jobAssignment.routes');
const employeeRoutes = require('./src/routes/employee.routes');
const boutiqueStockRequestRoutes = require('./src/routes/boutiqueStockRequest.routes');
const reportRoutes = require('./src/routes/report.routes');
const hobeRoutes = require('./src/routes/hobe.routes');
const procurementRoutes = require('./src/routes/procurement.routes');
const recoveryRoutes = require('./src/routes/recovery.routes');
const leaveRoutes = require('./src/routes/leave.routes');
const outstandRoutes = require('./src/routes/outstand.routes');
const casualWorkerRoutes = require('./src/routes/casualWorker.routes');
const payrollRoutes = require('./src/routes/payroll.routes');
const boutiqueStockRoutes = require('./src/routes/boutiqueStock.routes');
const generalStockRoutes = require('./src/routes/generalStock.routes');
const bindingStockRoutes = require('./src/routes/bindingStock.routes');
const machineRoutes = require('./src/routes/machine.routes');
const machineAssignmentRoutes = require('./src/routes/machineAssignment.routes');

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
app.use('/api/jobs/:jobId/items', jobItemRoutes);
app.use('/api/proformas', proformaRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/boutique', boutiqueRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/job-assignments', jobAssignmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/boutique-stock-requests', boutiqueStockRequestRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/hobes', hobeRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/outstands', outstandRoutes);
app.use('/api/casual-workers', casualWorkerRoutes);
app.use('/api/payrolls', payrollRoutes);
app.use('/api/boutique-stock', boutiqueStockRoutes);
app.use('/api/general-stock', generalStockRoutes);
app.use('/api/binding-stock', bindingStockRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/machine-assignments', machineAssignmentRoutes);

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
