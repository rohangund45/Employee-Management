import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { attendanceAPI } from "../services/api";
import toast from "react-hot-toast";
import { HiOutlineLogin, HiOutlineLogout, HiOutlineCalendar } from "react-icons/hi";

const statusBadge = {
  present: "bg-success/20 text-success",
  absent: "bg-danger/20 text-danger",
  late: "bg-warning/20 text-warning",
  "half-day": "bg-primary-500/20 text-primary-400",
  "on-leave": "bg-purple-500/20 text-purple-400",
};

export default function Attendance() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState({ records: [], summary: {} });
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          const res = await attendanceAPI.getAll({ date: new Date().toISOString() });
          setAllRecords(res.data.data);
        } else {
          const res = await attendanceAPI.getMy({ month, year });
          setData(res.data.data);
          // Check today's status
          const today = new Date().toISOString().split("T")[0];
          const todayRec = res.data.data.records.find(
            (r) => new Date(r.date).toISOString().split("T")[0] === today
          );
          if (todayRec) {
            setCheckedIn(true);
            setCheckedOut(Boolean(todayRec.checkOut));
          }
        }
      } catch (err) {
        toast.error("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isAdmin, month, year]);

  const handleCheckIn = async () => {
    try {
      await attendanceAPI.checkIn({});
      setCheckedIn(true);
      toast.success("Checked in successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceAPI.checkOut();
      setCheckedOut(true);
      toast.success("Checked out successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-out failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Attendance</h1>
      <p className="text-gray-400 mb-8">{isAdmin ? "Today's attendance overview" : "Track your attendance"}</p>

      {/* Employee: Check-in/out buttons */}
      {!isAdmin && (
        <div className="glass rounded-2xl p-6 mb-6 flex flex-wrap gap-4 items-center">
          <button onClick={handleCheckIn} disabled={checkedIn}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-success/20 text-success font-semibold hover:bg-success/30 disabled:opacity-40 transition-all">
            <HiOutlineLogin className="w-5 h-5" /> {checkedIn ? "Checked In ✓" : "Check In"}
          </button>
          <button onClick={handleCheckOut} disabled={!checkedIn || checkedOut}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-danger/20 text-danger font-semibold hover:bg-danger/30 disabled:opacity-40 transition-all">
            <HiOutlineLogout className="w-5 h-5" /> {checkedOut ? "Checked Out ✓" : "Check Out"}
          </button>
          <div className="ml-auto flex gap-2">
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-surface border border-white/10 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}
              className="px-3 py-2 rounded-xl bg-surface border border-white/10 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Employee: Monthly summary */}
      {!isAdmin && data.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: "Present", val: data.summary.present, color: "text-success" },
            { label: "Absent", val: data.summary.absent, color: "text-danger" },
            { label: "Late", val: data.summary.late, color: "text-warning" },
            { label: "Half Day", val: data.summary.halfDay, color: "text-primary-400" },
            { label: "On Leave", val: data.summary.onLeave, color: "text-purple-400" },
            { label: "Hours", val: data.summary.totalWorkingHours?.toFixed(1), color: "text-accent" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.val || 0}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Records table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {isAdmin && <th className="text-left py-4 px-6 text-gray-400 font-medium">Employee</th>}
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Date</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Check In</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Check Out</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Hours</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(isAdmin ? allRecords : data.records).map((rec) => (
                <tr key={rec._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  {isAdmin && (
                    <td className="py-3 px-6 text-gray-200">
                      {rec.employee?.user?.name || "—"}
                    </td>
                  )}
                  <td className="py-3 px-4 text-gray-300">{new Date(rec.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-gray-300">{rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : "—"}</td>
                  <td className="py-3 px-4 text-gray-300">{rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : "—"}</td>
                  <td className="py-3 px-4 text-gray-300">{rec.workingHours?.toFixed(1) || "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${statusBadge[rec.status] || ""}`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(isAdmin ? allRecords : data.records).length === 0 && (
                <tr><td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-gray-500">No attendance records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
