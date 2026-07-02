/**
 * Define all Sequelize model associations in one place.
 * This file must be required once at startup (before any queries run).
 */

const User = require('./User');
const Customer = require('./Customer');
const Job = require('./Job');
const Department = require('./Department');
const Notification = require('./Notification');
const NotificationRead = require('./NotificationRead');
const Payment = require('./Payment');
const BoutiqueCategory = require('./BoutiqueCategory');
const BoutiqueProduct = require('./BoutiqueProduct');
const BoutiqueStockMovement = require('./BoutiqueStockMovement');
const StockItem = require('./StockItem');
const StockEntry = require('./StockEntry');
const StockSortie = require('./StockSortie');
const JobItem = require('./JobItem');
const Proforma = require('./Proforma');
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
const Hobe = require('./Hobe');
const HobeSale = require('./HobeSale');
const JobDocument = require('./JobDocument');
const ProcurementLead = require('./ProcurementLead');
const ProcurementLeadDocument = require('./ProcurementLeadDocument');
const RecoveryRecord = require('./RecoveryRecord');
const LeaveRequest = require('./LeaveRequest');
const Outstand = require('./Outstand');
const CasualWorker = require('./CasualWorker');
const Payroll = require('./Payroll');
const BoutiqueStockItem = require('./BoutiqueStockItem');
const BoutiqueStockEntry = require('./BoutiqueStockEntry');
const BoutiqueStockSortie = require('./BoutiqueStockSortie');
const GeneralStockItem = require('./GeneralStockItem');
const GeneralStockEntry = require('./GeneralStockEntry');
const GeneralStockSortie = require('./GeneralStockSortie');
const BindingStockItem = require('./BindingStockItem');
const BindingStockEntry = require('./BindingStockEntry');
const BindingStockSortie = require('./BindingStockSortie');
const Machine = require('./Machine');
const MachineAssignment = require('./MachineAssignment');
const JobSpec = require('./JobSpec');
const JobSpecDocument = require('./JobSpecDocument');
const DepartmentSample = require('./DepartmentSample');
const DepartmentSampleDocument = require('./DepartmentSampleDocument');
// ProcurementLead → User (created by)
ProcurementLead.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(ProcurementLead, { foreignKey: 'createdById', as: 'procurementLeads' });

// ProcurementLeadDocument → ProcurementLead
ProcurementLeadDocument.belongsTo(ProcurementLead, { foreignKey: 'procurementLeadId', as: 'lead' });
ProcurementLead.hasMany(ProcurementLeadDocument, { foreignKey: 'procurementLeadId', as: 'documents' });

// ProcurementLeadDocument → User (uploaded by)
ProcurementLeadDocument.belongsTo(User, { foreignKey: 'uploadedById', as: 'uploadedBy' });
User.hasMany(ProcurementLeadDocument, { foreignKey: 'uploadedById', as: 'procurementDocuments' });

// JobDocument → Job
JobDocument.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(JobDocument, { foreignKey: 'jobId', as: 'documents' });

// JobDocument → User (uploaded by)
JobDocument.belongsTo(User, { foreignKey: 'uploadedById', as: 'uploadedBy' });
User.hasMany(JobDocument, { foreignKey: 'uploadedById', as: 'uploadedDocuments' });

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

// Notification → User (creator)
Notification.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(Notification, { foreignKey: 'createdById', as: 'createdNotifications' });

// NotificationRead → Notification
NotificationRead.belongsTo(Notification, { foreignKey: 'notificationId', as: 'notification' });
Notification.hasMany(NotificationRead, { foreignKey: 'notificationId', as: 'reads' });

// NotificationRead → User (recipient)
NotificationRead.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(NotificationRead, { foreignKey: 'userId', as: 'notificationReads' });

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

// Proforma → Job
Proforma.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(Proforma, { foreignKey: 'jobId', as: 'proformas' });

// Proforma → Customer
Proforma.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(Proforma, { foreignKey: 'customerId', as: 'proformas' });

// Proforma → User (created by)
Proforma.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(Proforma, { foreignKey: 'createdById', as: 'proformas' });

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

// Hobe → User (created by)
Hobe.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(Hobe, { foreignKey: 'createdById', as: 'hobes' });

// HobeSale → Hobe
HobeSale.belongsTo(Hobe, { foreignKey: 'hobeId', as: 'hobe' });
Hobe.hasMany(HobeSale, { foreignKey: 'hobeId', as: 'sales' });

// HobeSale → User (sold by)
HobeSale.belongsTo(User, { foreignKey: 'soldById', as: 'soldBy' });
User.hasMany(HobeSale, { foreignKey: 'soldById', as: 'hobeSales' });

// HobeSale → Customer (optional)
HobeSale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(HobeSale, { foreignKey: 'customerId', as: 'hobeSales' });

// RecoveryRecord → Job
RecoveryRecord.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(RecoveryRecord, { foreignKey: 'jobId', as: 'recoveryRecords' });

// RecoveryRecord → Customer
RecoveryRecord.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Customer.hasMany(RecoveryRecord, { foreignKey: 'customerId', as: 'recoveryRecords' });

// RecoveryRecord → User (recorded by)
RecoveryRecord.belongsTo(User, { foreignKey: 'recordedById', as: 'recordedBy' });
User.hasMany(RecoveryRecord, { foreignKey: 'recordedById', as: 'recordedRecoveries' });

// LeaveRequest → User (requester)
LeaveRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(LeaveRequest, { foreignKey: 'userId', as: 'leaveRequests' });

// LeaveRequest → User (reviewer)
LeaveRequest.belongsTo(User, { foreignKey: 'reviewedById', as: 'reviewedBy' });
User.hasMany(LeaveRequest, { foreignKey: 'reviewedById', as: 'reviewedLeaves' });

// Outstand → User (recorded by)
Outstand.belongsTo(User, { foreignKey: 'recordedById', as: 'recordedBy' });
User.hasMany(Outstand, { foreignKey: 'recordedById', as: 'recordedOutstands' });

// Outstand → User (approved by)
Outstand.belongsTo(User, { foreignKey: 'approvedById', as: 'approvedBy' });
User.hasMany(Outstand, { foreignKey: 'approvedById', as: 'approvedOutstands' });

// Payroll → Employee
Payroll.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(Payroll, { foreignKey: 'employeeId', as: 'payrolls' });

// Payroll → CasualWorker
Payroll.belongsTo(CasualWorker, { foreignKey: 'casualWorkerId', as: 'casualWorker' });
CasualWorker.hasMany(Payroll, { foreignKey: 'casualWorkerId', as: 'payrolls' });

// Payroll → User (created by)
Payroll.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(Payroll, { foreignKey: 'createdById', as: 'createdPayrolls' });

// BoutiqueStockItem → BoutiqueStockEntry
BoutiqueStockEntry.belongsTo(BoutiqueStockItem, { foreignKey: 'stockItemId', as: 'stockItem' });
BoutiqueStockItem.hasMany(BoutiqueStockEntry, { foreignKey: 'stockItemId', as: 'entries' });

// BoutiqueStockEntry → User (received by)
BoutiqueStockEntry.belongsTo(User, { foreignKey: 'receivedById', as: 'receivedBy' });
User.hasMany(BoutiqueStockEntry, { foreignKey: 'receivedById', as: 'boutiqueStockEntries' });

// BoutiqueStockItem → BoutiqueStockSortie
BoutiqueStockSortie.belongsTo(BoutiqueStockItem, { foreignKey: 'stockItemId', as: 'stockItem' });
BoutiqueStockItem.hasMany(BoutiqueStockSortie, { foreignKey: 'stockItemId', as: 'sorties' });

// BoutiqueStockSortie → User (requester)
BoutiqueStockSortie.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
User.hasMany(BoutiqueStockSortie, { foreignKey: 'requesterId', as: 'boutiqueStockSortieRequests' });

// BoutiqueStockSortie → User (approved by)
BoutiqueStockSortie.belongsTo(User, { foreignKey: 'approvedById', as: 'approvedBy' });
User.hasMany(BoutiqueStockSortie, { foreignKey: 'approvedById', as: 'approvedBoutiqueStockSorties' });

// GeneralStockItem → GeneralStockEntry
GeneralStockEntry.belongsTo(GeneralStockItem, { foreignKey: 'stockItemId', as: 'stockItem' });
GeneralStockItem.hasMany(GeneralStockEntry, { foreignKey: 'stockItemId', as: 'entries' });

// GeneralStockEntry → User (received by)
GeneralStockEntry.belongsTo(User, { foreignKey: 'receivedById', as: 'receivedBy' });
User.hasMany(GeneralStockEntry, { foreignKey: 'receivedById', as: 'generalStockEntries' });

// GeneralStockItem → GeneralStockSortie
GeneralStockSortie.belongsTo(GeneralStockItem, { foreignKey: 'stockItemId', as: 'stockItem' });
GeneralStockItem.hasMany(GeneralStockSortie, { foreignKey: 'stockItemId', as: 'sorties' });

// GeneralStockSortie → User (requester)
GeneralStockSortie.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
User.hasMany(GeneralStockSortie, { foreignKey: 'requesterId', as: 'generalStockSortieRequests' });

// GeneralStockSortie → User (approved by)
GeneralStockSortie.belongsTo(User, { foreignKey: 'approvedById', as: 'approvedBy' });
User.hasMany(GeneralStockSortie, { foreignKey: 'approvedById', as: 'approvedGeneralStockSorties' });

// BindingStockItem → BindingStockEntry
BindingStockEntry.belongsTo(BindingStockItem, { foreignKey: 'stockItemId', as: 'stockItem' });
BindingStockItem.hasMany(BindingStockEntry, { foreignKey: 'stockItemId', as: 'entries' });

// BindingStockEntry → User (received by)
BindingStockEntry.belongsTo(User, { foreignKey: 'receivedById', as: 'receivedBy' });
User.hasMany(BindingStockEntry, { foreignKey: 'receivedById', as: 'bindingStockEntries' });

// BindingStockItem → BindingStockSortie
BindingStockSortie.belongsTo(BindingStockItem, { foreignKey: 'stockItemId', as: 'stockItem' });
BindingStockItem.hasMany(BindingStockSortie, { foreignKey: 'stockItemId', as: 'sorties' });

// BindingStockSortie → User (requester)
BindingStockSortie.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
User.hasMany(BindingStockSortie, { foreignKey: 'requesterId', as: 'bindingStockSortieRequests' });

// BindingStockSortie → User (approved by)
BindingStockSortie.belongsTo(User, { foreignKey: 'approvedById', as: 'approvedBy' });
User.hasMany(BindingStockSortie, { foreignKey: 'approvedById', as: 'approvedBindingStockSorties' });

// BindingStockSortie → Job
BindingStockSortie.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(BindingStockSortie, { foreignKey: 'jobId', as: 'bindingStockSorties' });

// Machine → User (created by)
Machine.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(Machine, { foreignKey: 'createdById', as: 'machines' });

// Machine -> Department
Machine.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(Machine, { foreignKey: 'departmentId', as: 'machines' });

// MachineAssignment → Machine
MachineAssignment.belongsTo(Machine, { foreignKey: 'machineId', as: 'machine' });
Machine.hasMany(MachineAssignment, { foreignKey: 'machineId', as: 'assignments' });

// MachineAssignment → Employee
MachineAssignment.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(MachineAssignment, { foreignKey: 'employeeId', as: 'machineAssignments' });

// MachineAssignment → User (assigned by)
MachineAssignment.belongsTo(User, { foreignKey: 'assignedById', as: 'assignedBy' });
User.hasMany(MachineAssignment, { foreignKey: 'assignedById', as: 'machineAssignments' });

// Machine ↔ Employee (many-to-many via machine_assignments)
Machine.belongsToMany(Employee, { through: MachineAssignment, foreignKey: 'machineId', otherKey: 'employeeId', as: 'workers' });
Employee.belongsToMany(Machine, { through: MachineAssignment, foreignKey: 'employeeId', otherKey: 'machineId', as: 'machines' });

// JobSpec -> Job
JobSpec.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });
Job.hasMany(JobSpec, { foreignKey: 'jobId', as: 'specs' });

// JobSpec -> User (added by)
JobSpec.belongsTo(User, { foreignKey: 'addedById', as: 'addedBy' });
User.hasMany(JobSpec, { foreignKey: 'addedById', as: 'jobSpecs' });

// JobSpecDocument -> JobSpec
JobSpecDocument.belongsTo(JobSpec, { foreignKey: 'jobSpecId', as: 'spec' });
JobSpec.hasMany(JobSpecDocument, { foreignKey: 'jobSpecId', as: 'documents' });

// JobSpecDocument -> User (uploaded by)
JobSpecDocument.belongsTo(User, { foreignKey: 'uploadedById', as: 'uploadedBy' });
User.hasMany(JobSpecDocument, { foreignKey: 'uploadedById', as: 'jobSpecDocuments' });
// DepartmentSample -> Department
DepartmentSample.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(DepartmentSample, { foreignKey: 'departmentId', as: 'samples' });

// DepartmentSample -> User (createdBy)
DepartmentSample.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(DepartmentSample, { foreignKey: 'createdById', as: 'departmentSamples' });

// DepartmentSample -> User (reviewedBy)
DepartmentSample.belongsTo(User, { foreignKey: 'reviewedById', as: 'reviewedBy' });
User.hasMany(DepartmentSample, { foreignKey: 'reviewedById', as: 'reviewedSamples' });

// DepartmentSampleDocument -> DepartmentSample
DepartmentSampleDocument.belongsTo(DepartmentSample, { foreignKey: 'sampleId', as: 'sample' });
DepartmentSample.hasMany(DepartmentSampleDocument, { foreignKey: 'sampleId', as: 'documents' });

// DepartmentSampleDocument -> User (uploadedBy)
DepartmentSampleDocument.belongsTo(User, { foreignKey: 'uploadedById', as: 'uploadedBy' });
User.hasMany(DepartmentSampleDocument, { foreignKey: 'uploadedById', as: 'sampleDocuments' });

module.exports = { User, Customer, Job, Department, Notification, NotificationRead, Payment, BoutiqueCategory, BoutiqueProduct, BoutiqueStockMovement, StockItem, StockEntry, StockSortie, JobItem, Proforma, CustomerVisit, Permission, RolePermission, Role, Invoice, EmployeeJobAssignment, MaterialRequest, MaterialRequestItem, BoutiqueStockRequest, BoutiqueStockRequestItem, BoutiqueSale, Report, Hobe, HobeSale, JobDocument, ProcurementLead, ProcurementLeadDocument, RecoveryRecord, Outstand, CasualWorker, Payroll, BoutiqueStockItem, BoutiqueStockEntry, BoutiqueStockSortie, GeneralStockItem, GeneralStockEntry, GeneralStockSortie, BindingStockItem, BindingStockEntry, BindingStockSortie, Machine, MachineAssignment, JobSpec, JobSpecDocument, DepartmentSample, DepartmentSampleDocument };
