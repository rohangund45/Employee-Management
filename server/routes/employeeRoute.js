import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addEmployee, upload, getEmployees, getEmployee, updateEmployee } from '../controllers/employeeController.js';

const router = express.Router();

// ✅ Field name here must match <input name="profileImage" />
router.get('/', authMiddleware, getEmployees)
router.post('/add', upload.single("profileImage"), addEmployee);
router.get('/:id', authMiddleware, getEmployee);
router.put('/:id', authMiddleware, updateEmployee);

export default router;
