const { Leave, Employee } = require("../models");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * POST /api/leaves
 * Employee applies for leave
 */
const applyLeave = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee profile not found" });
  }

  const { leaveType, startDate, endDate, reason } = req.body;

  // Check for overlapping leaves
  const overlap = await Leave.findOne({
    employee: employee._id,
    status: { $in: ["pending", "approved"] },
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
    ],
  });

  if (overlap) {
    return res.status(400).json({
      success: false,
      message: "You already have a leave request for overlapping dates",
    });
  }

  const leave = await Leave.create({
    employee: employee._id,
    leaveType,
    startDate,
    endDate,
    reason,
  });

  res.status(201).json({
    success: true,
    message: "Leave application submitted successfully",
    data: leave,
  });
});

/**
 * GET /api/leaves/my
 * Get current employee's leave history
 */
const getMyLeaves = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee profile not found" });
  }

  const { status, year } = req.query;
  const filter = { employee: employee._id };
  if (status) filter.status = status;

  if (year) {
    filter.startDate = {
      $gte: new Date(parseInt(year), 0, 1),
      $lte: new Date(parseInt(year), 11, 31),
    };
  }

  const leaves = await Leave.find(filter)
    .populate("approvedBy", "name email")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: leaves });
});

/**
 * GET /api/leaves/balance
 * Get leave balance for current employee
 */
const getLeaveBalance = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) {
    return res.status(404).json({ success: false, message: "Employee profile not found" });
  }

  const year = parseInt(req.query.year) || new Date().getFullYear();
  const balance = await Leave.getLeaveBalance(employee._id, year);

  res.json({ success: true, data: { year, balance } });
});

/**
 * GET /api/leaves/all
 * Get all leave requests (admin only)
 */
const getAllLeaves = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Leave.countDocuments(filter);

  const leaves = await Leave.find(filter)
    .populate({
      path: "employee",
      populate: { path: "user", select: "name email avatar" },
    })
    .populate("approvedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: leaves,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * PUT /api/leaves/:id/approve
 * Approve a leave request (admin only)
 */
const approveLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    return res.status(404).json({ success: false, message: "Leave request not found" });
  }

  if (leave.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: `Leave is already ${leave.status}`,
    });
  }

  leave.status = "approved";
  leave.approvedBy = req.user.id;
  leave.adminRemarks = req.body.remarks || "";
  await leave.save();

  res.json({
    success: true,
    message: "Leave approved",
    data: leave,
  });
});

/**
 * PUT /api/leaves/:id/reject
 * Reject a leave request (admin only)
 */
const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    return res.status(404).json({ success: false, message: "Leave request not found" });
  }

  if (leave.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: `Leave is already ${leave.status}`,
    });
  }

  leave.status = "rejected";
  leave.approvedBy = req.user.id;
  leave.adminRemarks = req.body.remarks || "No reason provided";
  await leave.save();

  res.json({
    success: true,
    message: "Leave rejected",
    data: leave,
  });
});

/**
 * DELETE /api/leaves/:id
 * Cancel a pending leave (by the employee)
 */
const cancelLeave = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user.id });
  const leave = await Leave.findOne({ _id: req.params.id, employee: employee._id });

  if (!leave) {
    return res.status(404).json({ success: false, message: "Leave request not found" });
  }

  if (leave.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: "Only pending leaves can be cancelled",
    });
  }

  leave.status = "cancelled";
  await leave.save();

  res.json({ success: true, message: "Leave cancelled", data: leave });
});

module.exports = {
  applyLeave,
  getMyLeaves,
  getLeaveBalance,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
};
