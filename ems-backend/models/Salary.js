const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee reference is required"],
    },
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: [1, "Month must be between 1 and 12"],
      max: [12, "Month must be between 1 and 12"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [2020, "Year must be 2020 or later"],
    },
    basicSalary: {
      type: Number,
      required: [true, "Basic salary is required"],
      min: [0, "Basic salary cannot be negative"],
    },
    allowances: {
      hra: { type: Number, default: 0, min: 0 },
      transport: { type: Number, default: 0, min: 0 },
      medical: { type: Number, default: 0, min: 0 },
      special: { type: Number, default: 0, min: 0 },
    },
    deductions: {
      tax: { type: Number, default: 0, min: 0 },
      pf: { type: Number, default: 0, min: 0 },
      insurance: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 },
    },
    bonus: {
      type: Number,
      default: 0,
      min: [0, "Bonus cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "paid", "on-hold"],
        message: "{VALUE} is not a valid payment status",
      },
      default: "pending",
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [300, "Remarks cannot exceed 300 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Indexes ---
// Compound index: one salary record per employee per month per year
salarySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
salarySchema.index({ paymentStatus: 1 });
salarySchema.index({ year: 1, month: 1 });

// --- Virtual: total allowances ---
salarySchema.virtual("totalAllowances").get(function () {
  const { hra, transport, medical, special } = this.allowances || {};
  return (hra || 0) + (transport || 0) + (medical || 0) + (special || 0);
});

// --- Virtual: total deductions ---
salarySchema.virtual("totalDeductions").get(function () {
  const { tax, pf, insurance, other } = this.deductions || {};
  return (tax || 0) + (pf || 0) + (insurance || 0) + (other || 0);
});

// --- Virtual: gross salary ---
salarySchema.virtual("grossSalary").get(function () {
  return this.basicSalary + this.totalAllowances + this.bonus;
});

// --- Virtual: net salary ---
salarySchema.virtual("netSalary").get(function () {
  return this.grossSalary - this.totalDeductions;
});

// --- Virtual: month name ---
salarySchema.virtual("monthName").get(function () {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return months[this.month - 1];
});

module.exports = mongoose.model("Salary", salarySchema);
