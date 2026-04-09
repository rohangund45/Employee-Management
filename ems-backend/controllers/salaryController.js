const { Salary, Employee } = require("../models");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * POST /api/salary
 * Generate salary record for an employee (admin only)
 */
const createSalary = asyncHandler(async (req, res) => {
  const { employeeId, month, year, allowances, deductions, bonus, remarks } = req.body;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee not found" });
  }

  const salary = await Salary.create({
    employee: employeeId,
    month,
    year,
    basicSalary: employee.salary.basic,
    allowances: allowances || {
      hra: Math.round(employee.salary.basic * 0.4),
      transport: 1600,
      medical: 1250,
      special: employee.salary.allowances || 0,
    },
    deductions: deductions || {
      tax: Math.round(employee.salary.basic * 0.1),
      pf: Math.round(employee.salary.basic * 0.12),
      insurance: 500,
      other: employee.salary.deductions || 0,
    },
    bonus: bonus || 0,
    remarks: remarks || "",
  });

  res.status(201).json({
    success: true,
    message: "Salary record created",
    data: salary,
  });
});

/**
 * GET /api/salary/employee/:employeeId
 * Get salary history for an employee
 */
const getEmployeeSalary = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const filter = { employee: req.params.employeeId };
  if (year) filter.year = parseInt(year);

  const salaries = await Salary.find(filter)
    .populate({
      path: "employee",
      populate: { path: "user", select: "name email" },
    })
    .sort({ year: -1, month: -1 });

  res.json({ success: true, data: salaries });
});

/**
 * GET /api/salary/my
 * Get current employee's salary history (or all if admin)
 */
const getMySalary = asyncHandler(async (req, res) => {
  const { year } = req.query;

  // Admin: return all salaries
  if (req.user.role === "admin") {
    const filter = {};
    if (year) filter.year = parseInt(year);

    const salaries = await Salary.find(filter)
      .populate({
        path: "employee",
        populate: { path: "user", select: "name email" },
      })
      .sort({ year: -1, month: -1 });

    return res.json({ success: true, data: salaries });
  }

  // Employee: return own salaries
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) {
    return res.json({ success: true, data: [] }); // Return empty instead of 404
  }

  const filter = { employee: employee._id };
  if (year) filter.year = parseInt(year);

  const salaries = await Salary.find(filter).sort({ year: -1, month: -1 });

  res.json({ success: true, data: salaries });
});

/**
 * PUT /api/salary/:id/pay
 * Mark salary as paid (admin only)
 */
const markAsPaid = asyncHandler(async (req, res) => {
  const salary = await Salary.findById(req.params.id);
  if (!salary) {
    return res.status(404).json({ success: false, message: "Salary record not found" });
  }

  if (salary.paymentStatus === "paid") {
    return res.status(400).json({ success: false, message: "Salary already paid" });
  }

  salary.paymentStatus = "paid";
  salary.paymentDate = new Date();
  await salary.save();

  res.json({
    success: true,
    message: "Salary marked as paid",
    data: salary,
  });
});

/**
 * PUT /api/salary/:id
 * Update salary record (admin only)
 */
const updateSalary = asyncHandler(async (req, res) => {
  const { allowances, deductions, bonus, remarks, paymentStatus } = req.body;

  const salary = await Salary.findById(req.params.id);
  if (!salary) {
    return res.status(404).json({ success: false, message: "Salary record not found" });
  }

  if (allowances) salary.allowances = { ...salary.allowances.toObject(), ...allowances };
  if (deductions) salary.deductions = { ...salary.deductions.toObject(), ...deductions };
  if (bonus !== undefined) salary.bonus = bonus;
  if (remarks) salary.remarks = remarks;
  if (paymentStatus) salary.paymentStatus = paymentStatus;

  await salary.save();

  res.json({
    success: true,
    message: "Salary record updated",
    data: salary,
  });
});

/**
 * POST /api/salary/generate-bulk
 * Generate salary for all active employees for a month (admin only)
 */
const generateBulkSalary = asyncHandler(async (req, res) => {
  const { month, year } = req.body;

  const employees = await Employee.find({ status: "active" });
  const results = { created: 0, skipped: 0, errors: [] };

  for (const emp of employees) {
    try {
      // Skip if salary already exists for this month
      const exists = await Salary.findOne({ employee: emp._id, month, year });
      if (exists) {
        results.skipped++;
        continue;
      }

      await Salary.create({
        employee: emp._id,
        month,
        year,
        basicSalary: emp.salary.basic,
        allowances: {
          hra: Math.round(emp.salary.basic * 0.4),
          transport: 1600,
          medical: 1250,
          special: emp.salary.allowances || 0,
        },
        deductions: {
          tax: Math.round(emp.salary.basic * 0.1),
          pf: Math.round(emp.salary.basic * 0.12),
          insurance: 500,
          other: emp.salary.deductions || 0,
        },
      });
      results.created++;
    } catch (err) {
      results.errors.push({ employeeId: emp.employeeId, error: err.message });
    }
  }

  res.json({
    success: true,
    message: `Bulk salary generation complete. Created: ${results.created}, Skipped: ${results.skipped}`,
    data: results,
  });
});

module.exports = {
  createSalary,
  getEmployeeSalary,
  getMySalary,
  markAsPaid,
  updateSalary,
  generateBulkSalary,
};
