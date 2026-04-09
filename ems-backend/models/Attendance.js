const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee reference is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ["present", "absent", "half-day", "late", "on-leave"],
        message: "{VALUE} is not a valid attendance status",
      },
      default: "present",
    },
    workingHours: {
      type: Number,
      default: 0,
      min: [0, "Working hours cannot be negative"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, "Notes cannot exceed 200 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// --- Indexes ---
// Compound index: one attendance record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

// --- Pre-save: auto-calculate working hours ---
attendanceSchema.pre("save", function (next) {
  if (this.checkIn && this.checkOut) {
    const diffMs = this.checkOut.getTime() - this.checkIn.getTime();
    this.workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

// --- Static: get monthly attendance for an employee ---
attendanceSchema.statics.getMonthlyAttendance = function (employeeId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return this.find({
    employee: employeeId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });
};

// --- Static: attendance summary for a given month ---
attendanceSchema.statics.getMonthlySummary = async function (employeeId, year, month) {
  const records = await this.getMonthlyAttendance(employeeId, year, month);

  return {
    totalDays: records.length,
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    halfDay: records.filter((r) => r.status === "half-day").length,
    late: records.filter((r) => r.status === "late").length,
    onLeave: records.filter((r) => r.status === "on-leave").length,
    totalWorkingHours: records.reduce((sum, r) => sum + r.workingHours, 0),
  };
};

module.exports = mongoose.model("Attendance", attendanceSchema);
