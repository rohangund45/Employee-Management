import mongoose from "mongoose";
console.log("📦 Mongoose Models:", mongoose.modelNames());


import multer from "multer";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from 'bcrypt';
import path from "path";
import fs from "fs";
import Department from "../models/Department.js";

// Ensure upload directory exists
const uploadDir = "public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const addEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
      password,
      role,
    } = req.body;

    console.log("Received form data:", req.body);
    console.log("Received file:", req.file);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      profileImage: req.file ? req.file.filename : "",
    });

    const savedUser = await newUser.save().catch((err) => {
      console.error("User Save Error:", err);
      throw err;
    });

    const newEmployee = new Employee({
      userId: savedUser._id,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      salary,
    });

    await newEmployee.save().catch((err) => {
      console.error("Employee Save Error:", err);
      throw err;
    });

    return res.status(200).json({ success: true, message: "Employee created" });

    } catch (error) {
        console.error("❌ Error in addEmployee:", error);
        console.log("🧾 BODY:", req.body);
        console.log("📎 FILE:", req.file);
        return res.status(500).json({
            success: false,
            error: error.message || "Server error in adding employee",
        });
    }


};

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('userId', '-password') // ✅ populate the correct ref
      .populate('department');

    return res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error("❌ Get Employees Error:", error);
    return res.status(500).json({ success: false, error: "Get Employee server error" });
  }
}

const getEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findById(id)
      .populate('userId', '-password')
      .populate('department');

    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" }); // ✅ this helps frontend
    }

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error("❌ Get Employee Error:", error);
    return res.status(500).json({ success: false, error: "Server error in fetching employee" });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔧 Updating employee with ID:", id);
    const { name, maritalStatus, designation, department, salary } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      { _id: employee.userId },
      { name },
      { new: true }
    );

    const updatedEmployee = await Employee.findByIdAndUpdate(
      { _id: id },
      { maritalStatus, designation, salary, department },
      { new: true }
    );

    if (!updatedUser || !updatedEmployee) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    return res.status(200).json({ success: true, message: "Employee Updated" });
  } catch (error) {
    console.error("❌ Error in updateEmployee:", error);
    return res.status(500).json({ success: false, error: "Server error in updating employee" });
  }
};



export { addEmployee, upload, getEmployees, getEmployee, updateEmployee };
