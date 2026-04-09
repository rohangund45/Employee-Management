/**
 * Database Seed Script
 * Run with: node seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { User, Employee, Attendance, Leave, Salary } = require("./models");

const ADMIN = {
  name: "Admin User",
  email: "admin@ems.com",
  password: "Admin@123",
  role: "admin",
};

const EMPLOYEES = [
  {
    name: "Rahul Sharma",
    email: "rahul@ems.com",
    password: "Employee@123",
    department: "Engineering",
    designation: "Senior Developer",
    phone: "+91 9876543210",
    dateOfBirth: new Date("1995-03-15"),
    basic: 75000,
  },
  {
    name: "Priya Patel",
    email: "priya@ems.com",
    password: "Employee@123",
    department: "Design",
    designation: "UI/UX Designer",
    phone: "+91 9876543211",
    dateOfBirth: new Date("1997-07-22"),
    basic: 60000,
  },
  {
    name: "Amit Kumar",
    email: "amit@ems.com",
    password: "Employee@123",
    department: "Marketing",
    designation: "Marketing Manager",
    phone: "+91 9876543212",
    dateOfBirth: new Date("1993-11-10"),
    basic: 65000,
  },
  {
    name: "Sneha Reddy",
    email: "sneha@ems.com",
    password: "Employee@123",
    department: "Human Resources",
    designation: "HR Specialist",
    phone: "+91 9876543213",
    dateOfBirth: new Date("1996-05-28"),
    basic: 55000,
  },
  {
    name: "Vikram Singh",
    email: "vikram@ems.com",
    password: "Employee@123",
    department: "Finance",
    designation: "Financial Analyst",
    phone: "+91 9876543214",
    dateOfBirth: new Date("1994-09-05"),
    basic: 70000,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // 🗑️ Clear DB
    console.log("🗑️ Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({}),
      Salary.deleteMany({}),
    ]);

    // 👑 Create Admin (NO HASH HERE)
    const admin = await User.create(ADMIN);
    console.log(`👑 Admin created: ${ADMIN.email}`);

    const employeeRecords = [];

    // 👥 Create Employees
    for (const emp of EMPLOYEES) {
      const user = await User.create({
        name: emp.name,
        email: emp.email,
        password: emp.password, // plain password
        role: "employee",
      });

      const employee = await Employee.create({
        user: user._id,
        department: emp.department,
        designation: emp.designation,
        phone: emp.phone,
        dateOfBirth: emp.dateOfBirth,
        dateOfJoining: new Date(),
        address: {
          street: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          country: "India",
        },
        salary: {
          basic: emp.basic,
          allowances: Math.round(emp.basic * 0.2),
          deductions: Math.round(emp.basic * 0.1),
        },
      });

      employeeRecords.push(employee);
      console.log(`👤 ${emp.name} created`);
    }

    // 📋 Attendance
    const now = new Date();
    const today = now.getDate();

    for (const emp of employeeRecords) {
      for (let day = 1; day <= today; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);

        if (date.getDay() === 0 || date.getDay() === 6) continue;

        await Attendance.create({
          employee: emp._id,
          date,
          checkIn: new Date(date.setHours(9, 0)),
          checkOut: new Date(date.setHours(17, 0)),
          status: "present",
        });
      }
    }

    console.log("📋 Attendance added");

    // 📅 Leaves
    await Leave.create({
      employee: employeeRecords[0]._id,
      leaveType: "casual",
      startDate: new Date(),
      endDate: new Date(),
      reason: "Personal work",
      status: "approved",
      approvedBy: admin._id,
    });

    console.log("📅 Leave added");

    // 💰 Salary
    for (const emp of employeeRecords) {
      await Salary.create({
        employee: emp._id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        basicSalary: emp.salary.basic,
        allowances: {
          hra: Math.round(emp.salary.basic * 0.4),
        },
        deductions: {
          tax: Math.round(emp.salary.basic * 0.1),
        },
        paymentStatus: "paid",
        paymentDate: new Date(),
      });
    }

    console.log("💰 Salary added");

    console.log("\n🎉 SEED COMPLETED SUCCESSFULLY\n");

    console.log("LOGIN:");
    console.log("Admin → admin@ems.com / Admin@123");
    console.log("Employee → rahul@ems.com / Employee@123");

    process.exit();
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
}

seed();