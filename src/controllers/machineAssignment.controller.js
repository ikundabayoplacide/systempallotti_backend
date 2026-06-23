const Machine = require('../database/models/Machine');
const MachineAssignment = require('../database/models/MachineAssignment');
const Employee = require('../database/models/Employee');
const User = require('../database/models/User');
const { success, error } = require('../utils/apiResponse');

const assignmentIncludes = [
  { model: Machine, as: 'machine', attributes: ['id', 'name', 'status'] },
  { model: Employee, as: 'employee', attributes: ['id', 'fullName', 'phoneNumber', 'departmentId'] },
  { model: User, as: 'assignedBy', attributes: ['id', 'name', 'role'] },
];

/**
 * POST /api/machine-assignments
 * Assign a machine to a worker (employee).
 * Body: { machineId, employeeId, note? }
 */
const assignMachine = async (req, res, next) => {
  try {
    const { machineId, employeeId, note } = req.body;

    const machine = await Machine.findByPk(machineId);
    if (!machine) return error(res, 'Machine not found.', 404);
    if (machine.status === 'inactive') return error(res, 'Cannot assign an inactive machine.', 422);

    const employee = await Employee.findOne({ where: { id: employeeId, isActive: true } });
    if (!employee) return error(res, 'Employee not found or inactive.', 404);

    const existing = await MachineAssignment.findOne({ where: { machineId, employeeId } });
    if (existing) return error(res, 'This machine is already assigned to this employee.', 409);

    const assignment = await MachineAssignment.create({
      machineId,
      employeeId,
      assignedById: req.user.id,
      assignedAt: new Date(),
      note: note || null,
    });

    const created = await MachineAssignment.findByPk(assignment.id, { include: assignmentIncludes });
    return success(res, created, 'Machine assigned to employee successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/machine-assignments/:id
 * Unassign a machine from a worker.
 */
const unassignMachine = async (req, res, next) => {
  try {
    const assignment = await MachineAssignment.findByPk(req.params.id);
    if (!assignment) return error(res, 'Assignment not found.', 404);

    await assignment.destroy();
    return success(res, null, 'Machine unassigned successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/machine-assignments/machine/:machineId
 * Get all employees assigned to a specific machine.
 */
const getAssignmentsByMachine = async (req, res, next) => {
  try {
    const machine = await Machine.findByPk(req.params.machineId);
    if (!machine) return error(res, 'Machine not found.', 404);

    const assignments = await MachineAssignment.findAll({
      where: { machineId: req.params.machineId },
      include: assignmentIncludes,
      order: [['assignedAt', 'DESC']],
    });

    return success(res, { machine: { id: machine.id, name: machine.name, status: machine.status }, assignments });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/machine-assignments/employee/:employeeId
 * Get all machines assigned to a specific employee.
 */
const getAssignmentsByEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByPk(req.params.employeeId);
    if (!employee) return error(res, 'Employee not found.', 404);

    const assignments = await MachineAssignment.findAll({
      where: { employeeId: req.params.employeeId },
      include: assignmentIncludes,
      order: [['assignedAt', 'DESC']],
    });

    return success(res, { employee: { id: employee.id, fullName: employee.fullName }, assignments });
  } catch (err) {
    next(err);
  }
};

module.exports = { assignMachine, unassignMachine, getAssignmentsByMachine, getAssignmentsByEmployee };
