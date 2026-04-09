const router = require("express").Router();
const { getStats, getEmployeeDashboard } = require("../controllers/dashboardController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect);

router.get("/stats", adminOnly, getStats);      // Admin dashboard
router.get("/employee", getEmployeeDashboard);   // Employee self-dashboard

module.exports = router;
