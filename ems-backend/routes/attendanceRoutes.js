const router = require("express").Router();
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getEmployeeAttendance,
  markAttendance,
  getAllAttendance,
} = require("../controllers/attendanceController");
const { protect, adminOnly } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Employee self-service
router.post("/check-in", checkIn);
router.put("/check-out", checkOut);
router.get("/my", getMyAttendance);

// Admin routes
router.get("/all", adminOnly, getAllAttendance);
router.post("/mark", adminOnly, markAttendance);
router.get("/employee/:employeeId", adminOnly, getEmployeeAttendance);

module.exports = router;
