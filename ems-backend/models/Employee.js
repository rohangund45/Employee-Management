const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      enum: {
        values: [
          "Engineering",
          "Marketing",
          "Sales",
          "Human Resources",
          "Finance",
          "Operations",
          "Design",
          "Support",
        ],
        message: "{VALUE} is not a valid department",
      },
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\+?[\d\s-]{10,15}$/, "Please enter a valid phone number"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    dateOfJoining: {
      type: Date,
      required: [true, "Date of joining is required"],
      default: Date.now,
    },
    address: {
      street: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      zipCode: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "India" },
    },
    salary: {
      basic: {
        type: Number,
        required: [true, "Basic salary is required"],
        min: [0, "Salary cannot be negative"],
      },
      allowances: { type: Number, default: 0, min: 0 },
      deductions: { type: Number, default: 0, min: 0 },
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "on-leave", "terminated"],
        message: "{VALUE} is not a valid status",
      },
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Indexes ---
// employeeId and user indexes are auto-created by unique:true
employeeSchema.index({ department: 1 });
employeeSchema.index({ status: 1 });

// --- Virtual: net salary ---
employeeSchema.virtual("salary.net").get(function () {
  return this.salary.basic + this.salary.allowances - this.salary.deductions;
});

// --- Virtual: full address ---
employeeSchema.virtual("fullAddress").get(function () {
  const { street, city, state, zipCode, country } = this.address || {};
  return [street, city, state, zipCode, country].filter(Boolean).join(", ");
});

// --- Pre-save: auto-generate employeeId ---
employeeSchema.pre("validate", async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model("Employee").countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Employee", employeeSchema);
