const { Attendance, Employee } = require("../models");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * POST /api/attendance/check-in
 * Employee checks in for the day
 */
const checkIn = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee profile not found" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already checked in today
  const existing = await Attendance.findOne({ employee: employee._id, date: today });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Already checked in today",
      data: existing,
    });
  }

  const now = new Date();
  const checkInHour = now.getHours();

  // Determine status based on check-in time (9 AM cutoff)
  const status = checkInHour >= 10 ? "late" : "present";

  const attendance = await Attendance.create({
    employee: employee._id,
    date: today,
    checkIn: now,
    status,
    notes: req.body.notes || "",
  });

  res.status(201).json({
    success: true,
    message: `Checked in successfully${status === "late" ? " (marked as late)" : ""}`,
    data: attendance,
  });
});

/**
 * PUT /api/attendance/check-out
 * Employee checks out for the day
 */
const checkOut = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee profile not found" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({ employee: employee._id, date: today });
  if (!attendance) {
    return res.status(400).json({
      success: false,
      message: "No check-in found for today. Please check in first.",
    });
  }

  if (attendance.checkOut) {
    return res.status(400).json({
      success: false,
      message: "Already checked out today",
    });
  }

  attendance.checkOut = new Date();
  await attendance.save(); // Pre-save hook calculates workingHours

  res.json({
    success: true,
    message: "Checked out successfully",
    data: attendance,
  });
});

/**
 * GET /api/attendance/my
 * Get current employee's attendance (with optional month/year filter)
 */
const getMyAttendance = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee profile not found" });
  }

  const { month, year } = req.query;
  const now = new Date();
  const targetMonth = parseInt(month) || now.getMonth() + 1;
  const targetYear = parseInt(year) || now.getFullYear();

  const records = await Attendance.getMonthlyAttendance(employee._id, targetYear, targetMonth);
  const summary = await Attendance.getMonthlySummary(employee._id, targetYear, targetMonth);

  res.json({
    success: true,
    data: { records, summary, month: targetMonth, year: targetYear },
  });
});

/**
 * GET /api/attendance/employee/:employeeId
 * Get attendance for a specific employee (admin only)
 */
const getEmployeeAttendance = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const now = new Date();
  const targetMonth = parseInt(month) || now.getMonth() + 1;
  const targetYear = parseInt(year) || now.getFullYear();

  const records = await Attendance.getMonthlyAttendance(
    req.params.employeeId,
    targetYear,
    targetMonth
  );
  const summary = await Attendance.getMonthlySummary(
    req.params.employeeId,
    targetYear,
    targetMonth
  );

  res.json({
    success: true,
    data: { records, summary, month: targetMonth, year: targetYear },
  });
});

/**
 * POST /api/attendance/mark
 * Admin marks attendance for an employee
 */
const markAttendance = asyncHandler(async (req, res) => {
  const { employeeId, date, status, checkIn, checkOut, notes } = req.body;

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  // Upsert: update if exists, create if not
  const attendance = await Attendance.findOneAndUpdate(
    { employee: employeeId, date: targetDate },
    {
      employee: employeeId,
      date: targetDate,
      status: status || "present",
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      notes: notes || "",
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: "Attendance marked successfully",
    data: attendance,
  });
});

/**
 * GET /api/attendance/all
 * Get all attendance for a date (admin only)
 */
const getAllAttendance = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const records = await Attendance.find({ date: targetDate })
    .populate({
      path: "employee",
      populate: { path: "user", select: "name email avatar" },
    })
    .sort({ checkIn: 1 });

  res.json({
    success: true,
    data: records,
    date: targetDate,
  });
});

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getEmployeeAttendance,
  markAttendance,
  getAllAttendance,
};
