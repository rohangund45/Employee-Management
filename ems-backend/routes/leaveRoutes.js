const router = require("express").Router();
const {
  applyLeave,
  getMyLeaves,
  getLeaveBalance,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
} = require("../controllers/leaveController");
const { protect, adminOnly } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Employee routes
router.post("/", applyLeave);
router.get("/my", getMyLeaves);
router.get("/balance", getLeaveBalance);
router.delete("/:id", cancelLeave);

// Admin routes
router.get("/all", adminOnly, getAllLeaves);
router.put("/:id/approve", adminOnly, approveLeave);
router.put("/:id/reject", adminOnly, rejectLeave);

module.exports = router;
