const router = require("express").Router();
const {
  createSalary,
  getEmployeeSalary,
  getMySalary,
  markAsPaid,
  updateSalary,
  generateBulkSalary,
} = require("../controllers/salaryController");
const { protect, adminOnly } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Employee route
router.get("/my", getMySalary);

// Admin routes
router.post("/", adminOnly, createSalary);
router.post("/generate-bulk", adminOnly, generateBulkSalary);
router.get("/employee/:employeeId", adminOnly, getEmployeeSalary);
router.put("/:id", adminOnly, updateSalary);
router.put("/:id/pay", adminOnly, markAsPaid);

module.exports = router;
