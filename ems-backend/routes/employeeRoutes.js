const router = require("express").Router();
const {
  getAllEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const { protect, adminOnly } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

router.route("/")
  .get(getAllEmployees)             // Both admin & employee can view list
  .post(adminOnly, createEmployee); // Only admin can create

router.route("/:id")
  .get(getEmployee)                // Both can view details
  .put(adminOnly, updateEmployee)  // Only admin can update
  .delete(adminOnly, deleteEmployee); // Only admin can delete

module.exports = router;
