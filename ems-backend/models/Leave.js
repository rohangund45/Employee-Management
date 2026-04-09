const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee reference is required"],
    },
    leaveType: {
      type: String,
      required: [true, "Leave type is required"],
      enum: {
        values: ["sick", "casual", "earned", "unpaid", "maternity", "paternity"],
        message: "{VALUE} is not a valid leave type",
      },
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    totalDays: {
      type: Number,
      min: [0.5, "Leave must be at least half a day"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
      minlength: [5, "Reason must be at least 5 characters"],
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected", "cancelled"],
        message: "{VALUE} is not a valid leave status",
      },
      default: "pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminRemarks: {
      type: String,
      trim: true,
      maxlength: [300, "Remarks cannot exceed 300 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// --- Indexes ---
leaveSchema.index({ employee: 1, status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ status: 1 });

// --- Pre-validate: endDate >= startDate + auto-calculate totalDays ---
leaveSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate) {
    if (this.endDate < this.startDate) {
      this.invalidate("endDate", "End date must be after or equal to start date");
    }
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  next();
});

// --- Static: get leave balance for an employee in a year ---
leaveSchema.statics.getLeaveBalance = async function (employeeId, year) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const leavePolicy = {
    sick: 12,
    casual: 12,
    earned: 15,
    unpaid: Infinity,
    maternity: 180,
    paternity: 15,
  };

  const usedLeaves = await this.aggregate([
    {
      $match: {
        employee: new mongoose.Types.ObjectId(employeeId),
        status: "approved",
        startDate: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: "$leaveType",
        totalUsed: { $sum: "$totalDays" },
      },
    },
  ]);

  const balance = {};
  for (const [type, total] of Object.entries(leavePolicy)) {
    const used = usedLeaves.find((l) => l._id === type);
    balance[type] = {
      total,
      used: used ? used.totalUsed : 0,
      remaining: total === Infinity ? "Unlimited" : total - (used ? used.totalUsed : 0),
    };
  }

  return balance;
};

module.exports = mongoose.model("Leave", leaveSchema);
