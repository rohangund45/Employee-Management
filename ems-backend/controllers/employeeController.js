const { Employee, User } = require("../models");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * GET /api/employees
 * Get all employees (with optional filters)
 */
const getAllEmployees = asyncHandler(async (req, res) => {
  const { department, status, search, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (department) filter.department = department;
  if (status) filter.status = status;

  // Search by employeeId or designation
  if (search) {
    filter.$or = [
      { employeeId: { $regex: search, $options: "i" } },
      { designation: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Employee.countDocuments(filter);

  const employees = await Employee.find(filter)
    .populate("user", "name email role avatar isActive")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: employees,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * GET /api/employees/:id
 * Get single employee by ID
 */
const getEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id).populate(
    "user",
    "name email role avatar isActive lastLogin"
  );

  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  res.json({ success: true, data: employee });
});

/**
 * POST /api/employees
 * Create a new employee (admin only)
 */
const createEmployee = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    department,
    designation,
    phone,
    dateOfBirth,
    dateOfJoining,
    address,
    salary,
  } = req.body;

  // Create user account first
  const user = await User.create({
    name,
    email,
    password: password || "Employee@123", // Default password
    role: "employee",
  });

  // Create employee profile
  const employee = await Employee.create({
    user: user._id,
    department,
    designation,
    phone,
    dateOfBirth,
    dateOfJoining,
    address,
    salary: salary || { basic: 0, allowances: 0, deductions: 0 },
  });

  const populated = await Employee.findById(employee._id).populate(
    "user",
    "name email role avatar"
  );

  res.status(201).json({
    success: true,
    message: "Employee created successfully",
    data: populated,
  });
});

/**
 * PUT /api/employees/:id
 * Update employee details (admin only)
 */
const updateEmployee = asyncHandler(async (req, res) => {
  const { name, email, department, designation, phone, dateOfBirth, address, salary, status } =
    req.body;

  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  // Update user fields if provided
  if (name || email) {
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;
    await User.findByIdAndUpdate(employee.user, userUpdate, { runValidators: true });
  }

  // Update employee fields
  if (department) employee.department = department;
  if (designation) employee.designation = designation;
  if (phone) employee.phone = phone;
  if (dateOfBirth) employee.dateOfBirth = dateOfBirth;
  if (status) employee.status = status;
  if (address) employee.address = { ...employee.address.toObject(), ...address };
  if (salary) employee.salary = { ...employee.salary.toObject(), ...salary };

  await employee.save();

  const updated = await Employee.findById(employee._id).populate(
    "user",
    "name email role avatar isActive"
  );

  res.json({
    success: true,
    message: "Employee updated successfully",
    data: updated,
  });
});

/**
 * DELETE /api/employees/:id
 * Delete employee and associated user (admin only)
 */
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  // Soft-delete: deactivate instead of hard delete
  await User.findByIdAndUpdate(employee.user, { isActive: false });
  employee.status = "terminated";
  await employee.save();

  res.json({
    success: true,
    message: "Employee deactivated successfully",
  });
});

module.exports = {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
