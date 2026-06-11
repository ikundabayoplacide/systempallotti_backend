/**
 * Define all Sequelize model associations in one place.
 * This file must be required once at startup (before any queries run).
 */

const User = require('./User');
const Customer = require('./Customer');
const Job = require('./Job');
const Department = require('./Department');
const Notification = require('./Notification');
const Payment = require('./Payment');
const BoutiqueCategory = require('./BoutiqueCategory');
const BoutiqueProduct = require('./BoutiqueProduct');
const BoutiqueStockMovement = require('./BoutiqueStockMovement');
const StockItem = require('./StockItem');
const StockEntry = require('./StockEntry');
const StockSortie = require('./StockSortie');
const JobItem = require('./JobItem');
const Quotation = require('./Quotation');
const CustomerVisit = require('./CustomerVisit');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const Role = require('./Role');
const Invoice = require('./Invoice');
const Employee = require('./Employee');
const EmployeeJobAssignment = require('./EmployeeJobAssignment');
const MaterialRequest = require('./MaterialRequest');
const MaterialRequestItem = require('./MaterialRequestItem');
const BoutiqueStockRequest = require('./BoutiqueStockRequest');
const BoutiqueStockRequestItem = require('./BoutiqueStockRequestItem');
const BoutiqueSale = require('./BoutiqueSale');
const Report = require('./Report');
// User → Department
User.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(User, { foreignKey: 'departmentId', as: 'users' });

// Employee → User (linked auth account)
Employee.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Employee, { foreignKey: 'userId', as: 'employee' });

// Employee → Department
Employee.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(Employee, { foreignKey: 'departmentId', as: 'employees' });

// Job → Customer
Job.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Job, { foreignKey: 'customerId', as: 'jobs' });

// Job → User (creator)
Job.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(Job, { foreignKey: 'createdById', as: 'createdJobs' });

// Job → Department (assigned to)
Job.belongsTo(Department, { foreignKey: 'departmentAssignedToId', as: 'departmentAssignedTo' });
Department.hasMany(Job, { foreignKey: 'departmentAssignedToId', as: 'jobs' });

// Notification → User
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

// Payment → Job
Payment.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(Payment, { foreignKey: 'jobId', as: 'payments' });

// Payment → User (recorded by)
Payment.belongsTo(User, { foreignKey: 'recordedById', as: 'recordedBy' });
User.hasMany(Payment, { foreignKey: 'recordedById', as: 'recordedPayments' });

// Payment → User (received by - receptionist)
Payment.belongsTo(User, { foreignKey: 'receivedById', as: 'receivedBy' });
User.hasMany(Payment, { foreignKey: 'receivedById', as: 'receivedPayments' });

// Payment → User (verified by - accountant)
Payment.belongsTo(User, { foreignKey: 'verifiedById', as: 'verifiedBy' });
User.hasMany(Payment, { foreignKey: 'verifiedById', as: 'verifiedPayments' });

// BoutiqueProduct → BoutiqueCategory
BoutiqueProduct.belongsTo(BoutiqueCategory, { foreignKey: 'categoryId', as: 'category' });
BoutiqueCategory.hasMany(BoutiqueProduct, { foreignKey: 'categoryId', as: 'products' });

// BoutiqueStockMovement → BoutiqueProduct
BoutiqueStockMovement.belongsTo(BoutiqueProduct, { foreignKey: 'productId', as: 'product' });
BoutiqueProduct.hasMany(BoutiqueStockMovement, { foreignKey: 'productId', as: 'stockMovements' });

// BoutiqueStockMovement → User
BoutiqueStockMovement.belongsTo(User, { foreignKey: 'changedById', as: 'changedBy' });
User.hasMany(BoutiqueStockMovement, { foreignKey: 'changedById', as: 'stockMovements' });

// StockItem → StockEntry
StockEntry.belongsTo(StockItem, { foreignKey: 'stockItemId', as: 'stockItem' });
StockItem.hasMany(StockEntry, { foreignKey: 'stockItemId', as: 'entries' });

// StockEntry → User (received by)
StockEntry.belongsTo(User, { foreignKey: 'receivedById', as: 'receivedBy' });
User.hasMany(StockEntry, { foreignKey: 'receivedById', as: 'stockEntries' });

// StockSortie → StockItem
StockSortie.belongsTo(StockItem, { foreignKey: 'stockItemId', as: 'stockItem' });
StockItem.hasMany(StockSortie, { foreignKey: 'stockItemId', as: 'sorties' });

// StockSortie → User (requester)
StockSortie.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
User.hasMany(StockSortie, { foreignKey: 'requesterId', as: 'requestedSorties' });

// StockSortie → User (approved by)
StockSortie.belongsTo(User, { foreignKey: 'approvedById', as: 'approvedBy' });
User.hasMany(StockSortie, { foreignKey: 'approvedById', as: 'approvedSorties' });

// StockSortie → Job
StockSortie.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(StockSortie, { foreignKey: 'jobId', as: 'stockSorties' });

// JobItem → Job
JobItem.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(JobItem, { foreignKey: 'jobId', as: 'jobItems' });

// JobItem → StockItem
JobItem.belongsTo(StockItem, { foreignKey: 'stockItemId', as: 'stockItem' });
StockItem.hasMany(JobItem, { foreignKey: 'stockItemId', as: 'jobItems' });

// Quotation → Job
Quotation.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(Quotation, { foreignKey: 'jobId', as: 'quotations' });

// Quotation → Customer
Quotation.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Quotation, { foreignKey: 'customerId', as: 'quotations' });

// Quotation → User (created by)
Quotation.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(Quotation, { foreignKey: 'createdById', as: 'quotations' });

// CustomerVisit → Customer
CustomerVisit.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(CustomerVisit, { foreignKey: 'customerId', as: 'visits' });

// CustomerVisit → User (recorded by)
CustomerVisit.belongsTo(User, { foreignKey: 'recordedById', as: 'recordedBy' });
User.hasMany(CustomerVisit, { foreignKey: 'recordedById', as: 'recordedVisits' });

// RolePermission → Permission
RolePermission.belongsTo(Permission, { foreignKey: 'permissionId', as: 'permission' });
Permission.hasMany(RolePermission, { foreignKey: 'permissionId', as: 'rolePermissions' });

// Invoice → Job
Invoice.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(Invoice, { foreignKey: 'jobId', as: 'invoices' });

// Invoice → Customer
Invoice.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Invoice, { foreignKey: 'customerId', as: 'invoices' });

// Invoice → User (created by)
Invoice.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(Invoice, { foreignKey: 'createdById', as: 'createdInvoices' });

// User → current assigned Job (employee workload)
User.belongsTo(Job, { foreignKey: 'currentJobId', as: 'currentJob' });
Job.hasMany(User, { foreignKey: 'currentJobId', as: 'assignedEmployees' });

// Employee → Job (legacy single jobId — kept for backward compatibility)
Employee.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(Employee, { foreignKey: 'jobId', as: 'employees' });

// Employee ↔ Job (many-to-many via employee_job_assignments)
Employee.belongsToMany(Job, {
  through: EmployeeJobAssignment,
  foreignKey: 'employeeId',
  otherKey: 'jobId',
  as: 'assignedJobs',
});
Job.belongsToMany(Employee, {
  through: EmployeeJobAssignment,
  foreignKey: 'jobId',
  otherKey: 'employeeId',
  as: 'assignedWorkers',
});

// MaterialRequest → Job
MaterialRequest.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(MaterialRequest, { foreignKey: 'jobId', as: 'materialRequests' });

// MaterialRequest → Employee
MaterialRequest.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(MaterialRequest, { foreignKey: 'employeeId', as: 'materialRequests' });

// MaterialRequest → User (respondedBy)
MaterialRequest.belongsTo(User, { foreignKey: 'respondedBy', as: 'responder' });

// MaterialRequestItem → MaterialRequest
MaterialRequestItem.belongsTo(MaterialRequest, { foreignKey: 'materialRequestId', as: 'materialRequest' });
MaterialRequest.hasMany(MaterialRequestItem, { foreignKey: 'materialRequestId', as: 'items' });

// EmployeeJobAssignment → User (assigned by)
EmployeeJobAssignment.belongsTo(User, { foreignKey: 'assignedById', as: 'assignedBy' });
User.hasMany(EmployeeJobAssignment, { foreignKey: 'assignedById', as: 'jobAssignments' });

// BoutiqueStockRequest → User (requestedBy)
BoutiqueStockRequest.belongsTo(User, { foreignKey: 'requestedById', as: 'requestedBy' });
User.hasMany(BoutiqueStockRequest, { foreignKey: 'requestedById', as: 'boutiqueStockRequests' });

// BoutiqueStockRequest → User (respondedBy)
BoutiqueStockRequest.belongsTo(User, { foreignKey: 'respondedBy', as: 'responder' });

// BoutiqueStockRequestItem → BoutiqueStockRequest
BoutiqueStockRequestItem.belongsTo(BoutiqueStockRequest, { foreignKey: 'boutiqueStockRequestId', as: 'request' });
BoutiqueStockRequest.hasMany(BoutiqueStockRequestItem, { foreignKey: 'boutiqueStockRequestId', as: 'items' });

// BoutiqueStockRequestItem → BoutiqueProduct
BoutiqueStockRequestItem.belongsTo(BoutiqueProduct, { foreignKey: 'productId', as: 'product' });
BoutiqueProduct.hasMany(BoutiqueStockRequestItem, { foreignKey: 'productId', as: 'stockRequestItems' });

// BoutiqueSale → BoutiqueProduct
BoutiqueSale.belongsTo(BoutiqueProduct, { foreignKey: 'productId', as: 'product' });
BoutiqueProduct.hasMany(BoutiqueSale, { foreignKey: 'productId', as: 'sales' });

// BoutiqueSale → User (sold by)
BoutiqueSale.belongsTo(User, { foreignKey: 'soldById', as: 'soldBy' });
User.hasMany(BoutiqueSale, { foreignKey: 'soldById', as: 'boutiqueSales' });

// BoutiqueSale → Customer (optional)
BoutiqueSale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(BoutiqueSale, { foreignKey: 'customerId', as: 'boutiqueSales' });

// Report → User (created by)
Report.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(Report, { foreignKey: 'createdById', as: 'reports' });

module.exports = { User, Customer, Job, Department, Notification, Payment, BoutiqueCategory, BoutiqueProduct, BoutiqueStockMovement, StockItem, StockEntry, StockSortie, JobItem, Quotation, CustomerVisit, Permission, RolePermission, Role, Invoice, EmployeeJobAssignment, MaterialRequest, MaterialRequestItem, BoutiqueStockRequest, BoutiqueStockRequestItem, BoutiqueSale, Report };
