const { Employee, Attendance, Leave, Salary, User } = require("../models");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * GET /api/dashboard/stats
 * Dashboard statistics (admin only)
 */
const getStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Run all queries in parallel
  const [
    totalEmployees,
    activeEmployees,
    departmentStats,
    todayAttendance,
    pendingLeaves,
    monthlyPayroll,
    recentHires,
  ] = await Promise.all([
    // Total employees
    Employee.countDocuments(),

    // Active employees
    Employee.countDocuments({ status: "active" }),

    // Employees by department
    Employee.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Today's attendance summary
    Attendance.aggregate([
      { $match: { date: today } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // Pending leave requests
    Leave.countDocuments({ status: "pending" }),

    // Monthly payroll total
    Salary.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      {
        $group: {
          _id: null,
          totalBasic: { $sum: "$basicSalary" },
          totalPaid: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$basicSalary", 0] },
          },
          count: { $sum: 1 },
          paidCount: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
          },
        },
      },
    ]),

    // Recent hires (last 30 days)
    Employee.find({
      dateOfJoining: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    })
      .populate("user", "name email avatar")
      .sort({ dateOfJoining: -1 })
      .limit(5),
  ]);

  // Format attendance for easier consumption
  const attendanceSummary = {};
  todayAttendance.forEach((item) => {
    attendanceSummary[item._id] = item.count;
  });

  res.json({
    success: true,
    data: {
      overview: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees: totalEmployees - activeEmployees,
        pendingLeaves,
      },
      departments: departmentStats,
      todayAttendance: {
        present: attendanceSummary["present"] || 0,
        absent: attendanceSummary["absent"] || 0,
        late: attendanceSummary["late"] || 0,
        halfDay: attendanceSummary["half-day"] || 0,
        onLeave: attendanceSummary["on-leave"] || 0,
      },
      payroll: monthlyPayroll[0] || {
        totalBasic: 0,
        totalPaid: 0,
        count: 0,
        paidCount: 0,
      },
      recentHires,
    },
  });
});

/**
 * GET /api/dashboard/employee
 * Employee self-dashboard
 */
const getEmployeeDashboard = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user.id }).populate(
    "user",
    "name email avatar"
  );

  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee profile not found" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [todayAttendance, monthlySummary, pendingLeaves, leaveBalance, latestSalary] =
    await Promise.all([
      Attendance.findOne({ employee: employee._id, date: today }),
      Attendance.getMonthlySummary(employee._id, currentYear, currentMonth),
      Leave.countDocuments({ employee: employee._id, status: "pending" }),
      Leave.getLeaveBalance(employee._id, currentYear),
      Salary.findOne({ employee: employee._id })
        .sort({ year: -1, month: -1 })
        .limit(1),
    ]);

  res.json({
    success: true,
    data: {
      employee,
      todayAttendance,
      monthlySummary,
      pendingLeaves,
      leaveBalance,
      latestSalary,
    },
  });
});

module.exports = { getStats, getEmployeeDashboard };
