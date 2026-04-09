/**
 * Database Seed Script
 * Run with: node seed.js
 *
 * Creates:
 * - 1 admin user
 * - 5 employees (with user accounts)
 * - Attendance records for current month
 * - Leave records
 * - Salary records for the last 3 months
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

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({}),
      Salary.deleteMany({}),
    ]);

    // Create admin
    console.log("👑 Creating admin user...");
    const admin = await User.create(ADMIN);
    console.log(`   Admin: ${admin.email} / ${ADMIN.password}`);

    // Create employees
    console.log("👥 Creating employees...");
    const employeeRecords = [];

    for (const emp of EMPLOYEES) {
      const user = await User.create({
        name: emp.name,
        email: emp.email,
        password: emp.password,
        role: "employee",
      });

      const employee = await Employee.create({
        user: user._id,
        department: emp.department,
        designation: emp.designation,
        phone: emp.phone,
        dateOfBirth: emp.dateOfBirth,
        dateOfJoining: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
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
      console.log(`   ✓ ${emp.name} (${employee.employeeId}) - ${emp.email}`);
    }

    // Create attendance records for current month
    console.log("📋 Creating attendance records...");
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const today = now.getDate();

    for (const emp of employeeRecords) {
      for (let day = 1; day <= Math.min(today, daysInMonth); day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const rand = Math.random();
        let status, checkInHour, checkInMin;

        if (rand < 0.75) {
          status = "present";
          checkInHour = 8 + Math.floor(Math.random() * 2);
          checkInMin = Math.floor(Math.random() * 60);
        } else if (rand < 0.85) {
          status = "late";
          checkInHour = 10 + Math.floor(Math.random() * 2);
          checkInMin = Math.floor(Math.random() * 60);
        } else if (rand < 0.95) {
          status = "half-day";
          checkInHour = 9;
          checkInMin = 0;
        } else {
          status = "absent";
          checkInHour = null;
          checkInMin = null;
        }

        const checkIn = checkInHour !== null
          ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), checkInHour, checkInMin)
          : null;
        const checkOut = checkIn && day < today
          ? new Date(date.getFullYear(), date.getMonth(), date.getDate(),
              status === "half-day" ? 13 : 17 + Math.floor(Math.random() * 2),
              Math.floor(Math.random() * 60))
          : null;

        try {
          await Attendance.create({
            employee: emp._id,
            date,
            checkIn,
            checkOut,
            status,
            notes: status === "late" ? "Traffic delay" : "",
          });
        } catch (err) {
          // Skip duplicates
        }
      }
    }
    console.log(`   ✓ Attendance records created for ${today} working days`);

    // Create leave records
    console.log("📅 Creating leave records...");
    const leaveData = [
      { empIdx: 0, type: "casual", start: 5, days: 2, status: "approved" },
      { empIdx: 1, type: "sick", start: 10, days: 3, status: "approved" },
      { empIdx: 2, type: "earned", start: 15, days: 5, status: "pending" },
      { empIdx: 3, type: "casual", start: 8, days: 1, status: "approved" },
      { empIdx: 4, type: "sick", start: 20, days: 2, status: "rejected" },
      { empIdx: 0, type: "earned", start: 25, days: 3, status: "pending" },
      { empIdx: 1, type: "casual", start: 18, days: 1, status: "pending" },
    ];

    for (const l of leaveData) {
      const startDate = new Date(now.getFullYear(), now.getMonth(), l.start);
      const endDate = new Date(now.getFullYear(), now.getMonth(), l.start + l.days - 1);

      await Leave.create({
        employee: employeeRecords[l.empIdx]._id,
        leaveType: l.type,
        startDate,
        endDate,
        reason: `${l.type.charAt(0).toUpperCase() + l.type.slice(1)} leave request - ${l.days} day(s)`,
        status: l.status,
        approvedBy: l.status !== "pending" ? admin._id : null,
        adminRemarks: l.status === "rejected" ? "Insufficient leave balance" : "",
      });
    }
    console.log(`   ✓ ${leaveData.length} leave records created`);

    // Create salary records for last 3 months
    console.log("💰 Creating salary records...");
    for (const emp of employeeRecords) {
      for (let m = 0; m < 3; m++) {
        const salMonth = now.getMonth() - m;
        const salYear = salMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const adjustedMonth = salMonth < 0 ? 12 + salMonth : salMonth;

        try {
          await Salary.create({
            employee: emp._id,
            month: adjustedMonth + 1,
            year: salYear,
            basicSalary: emp.salary.basic,
            allowances: {
              hra: Math.round(emp.salary.basic * 0.4),
              transport: 1600,
              medical: 1250,
              special: Math.round(emp.salary.basic * 0.1),
            },
            deductions: {
              tax: Math.round(emp.salary.basic * 0.1),
              pf: Math.round(emp.salary.basic * 0.12),
              insurance: 500,
              other: 0,
            },
            bonus: m === 0 ? 0 : Math.round(Math.random() * 5000),
            paymentStatus: m === 0 ? "pending" : "paid",
            paymentDate: m === 0 ? null : new Date(salYear, adjustedMonth, 28),
          });
        } catch (err) {
          // Skip duplicates
        }
      }
    }
    console.log(`   ✓ Salary records created for 3 months`);

    // Summary
    console.log("\n" + "═".repeat(50));
    console.log("🎉 Database seeded successfully!");
    console.log("═".repeat(50));
    console.log("\n📌 Login credentials:");
    console.log(`   Admin:    admin@ems.com / Admin@123`);
    console.log(`   Employee: rahul@ems.com / Employee@123`);
    console.log(`   Employee: priya@ems.com / Employee@123`);
    console.log(`   Employee: amit@ems.com  / Employee@123`);
    console.log(`   Employee: sneha@ems.com / Employee@123`);
    console.log(`   Employee: vikram@ems.com / Employee@123`);
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
}

seed();
