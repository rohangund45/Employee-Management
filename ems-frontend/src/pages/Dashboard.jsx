import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../services/api";
import toast from "react-hot-toast";
import {
  HiOutlineUserGroup,
  HiOutlineClipboardCheck,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineClock,
} from "react-icons/hi";

function StatCard({ icon: Icon, label, value, color, subtext }) {
  return (
    <div className="glass rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-200 animate-fadeIn">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function DepartmentChart({ departments }) {
  const maxCount = Math.max(...departments.map((d) => d.count), 1);
  return (
    <div className="glass rounded-2xl p-6 animate-fadeIn">
      <h3 className="text-lg font-semibold text-white mb-4">Employees by Department</h3>
      <div className="space-y-3">
        {departments.map((dept, i) => (
          <div key={dept._id} className="animate-slideIn" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">{dept._id}</span>
              <span className="text-gray-400">{dept.count}</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent transition-all duration-700"
                style={{ width: `${(dept.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendanceOverview({ attendance }) {
  const items = [
    { label: "Present", value: attendance.present, color: "bg-success" },
    { label: "Late", value: attendance.late, color: "bg-warning" },
    { label: "Absent", value: attendance.absent, color: "bg-danger" },
    { label: "On Leave", value: attendance.onLeave, color: "bg-primary-500" },
  ];
  return (
    <div className="glass rounded-2xl p-6 animate-fadeIn">
      <h3 className="text-lg font-semibold text-white mb-4">Today's Attendance</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="bg-surface rounded-xl p-4 text-center">
            <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-white">{item.value}</p>
            <p className="text-xs text-gray-400">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentHires({ hires }) {
  return (
    <div className="glass rounded-2xl p-6 animate-fadeIn">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Hires</h3>
      {hires.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent hires</p>
      ) : (
        <div className="space-y-3">
          {hires.map((emp) => (
            <div key={emp._id} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                {emp.user?.name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{emp.user?.name}</p>
                <p className="text-xs text-gray-500">{emp.designation} • {emp.department}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [empDash, setEmpDash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (isAdmin) {
          const res = await dashboardAPI.getStats();
          setStats(res.data.data);
        } else {
          const res = await dashboardAPI.getEmployee();
          setEmpDash(res.data.data);
        }
      } catch (err) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Admin Dashboard ──
  if (isAdmin && stats) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of your organization</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <StatCard icon={HiOutlineUserGroup} label="Total Employees" value={stats.overview.totalEmployees} color="bg-primary-600" subtext={`${stats.overview.activeEmployees} active`} />
          <StatCard icon={HiOutlineClipboardCheck} label="Present Today" value={stats.todayAttendance.present} color="bg-success" subtext={`${stats.todayAttendance.late} late`} />
          <StatCard icon={HiOutlineCalendar} label="Pending Leaves" value={stats.overview.pendingLeaves} color="bg-warning" subtext="Awaiting approval" />
          <StatCard icon={HiOutlineCurrencyDollar} label="Payroll Processed" value={`${stats.payroll.paidCount}/${stats.payroll.count}`} color="bg-accent" subtext="This month" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <DepartmentChart departments={stats.departments} />
          <AttendanceOverview attendance={stats.todayAttendance} />
          <RecentHires hires={stats.recentHires} />
        </div>
      </div>
    );
  }

  // ── Employee Dashboard ──
  if (!isAdmin && empDash) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
          <p className="text-gray-400 mt-1">Your overview at a glance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <StatCard icon={HiOutlineClipboardCheck} label="Today" value={empDash.todayAttendance?.status || "Not checked in"} color="bg-primary-600" />
          <StatCard icon={HiOutlineClock} label="This Month" value={`${empDash.monthlySummary?.present || 0} days`} color="bg-success" subtext="Present" />
          <StatCard icon={HiOutlineCalendar} label="Pending Leaves" value={empDash.pendingLeaves} color="bg-warning" />
          <StatCard icon={HiOutlineCurrencyDollar} label="Last Salary" value={empDash.latestSalary ? `₹${empDash.latestSalary.basicSalary?.toLocaleString()}` : "—"} color="bg-accent" subtext={empDash.latestSalary?.paymentStatus} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Attendance</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Present", val: empDash.monthlySummary?.present, color: "text-success" },
                { label: "Absent", val: empDash.monthlySummary?.absent, color: "text-danger" },
                { label: "Late", val: empDash.monthlySummary?.late, color: "text-warning" },
              ].map((item) => (
                <div key={item.label} className="bg-surface rounded-xl p-4">
                  <p className={`text-2xl font-bold ${item.color}`}>{item.val || 0}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
            <div className="space-y-3">
              {[
                ["Employee ID", empDash.employee?.employeeId],
                ["Department", empDash.employee?.department],
                ["Designation", empDash.employee?.designation],
                ["Status", empDash.employee?.status],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-400">{k}</span>
                  <span className="text-gray-200 font-medium capitalize">{v || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <p className="text-gray-400">No data available.</p>;
}
