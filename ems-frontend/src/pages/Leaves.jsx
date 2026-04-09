import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { leaveAPI } from "../services/api";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineCheck, HiOutlineX } from "react-icons/hi";

const statusBadge = {
  pending: "bg-warning/20 text-warning",
  approved: "bg-success/20 text-success",
  rejected: "bg-danger/20 text-danger",
  cancelled: "bg-gray-500/20 text-gray-400",
};

const leaveTypes = ["sick", "casual", "earned", "unpaid", "maternity", "paternity"];

export default function Leaves() {
  const { isAdmin } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ leaveType: "casual", startDate: "", endDate: "", reason: "" });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = isAdmin
        ? await leaveAPI.getAll({ limit: 50 })
        : await leaveAPI.getMy();
      setLeaves(isAdmin ? res.data.data : res.data.data);
    } catch {
      toast.error("Failed to load leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, [isAdmin]);

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await leaveAPI.apply(form);
      toast.success("Leave applied successfully");
      setShowForm(false);
      setForm({ leaveType: "casual", startDate: "", endDate: "", reason: "" });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply leave");
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === "approve") {
        await leaveAPI.approve(id, {});
        toast.success("Leave approved");
      } else {
        const remarks = window.prompt("Reason for rejection:");
        if (remarks === null) return;
        await leaveAPI.reject(id, { remarks });
        toast.success("Leave rejected");
      }
      fetchLeaves();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;
    try {
      await leaveAPI.cancel(id);
      toast.success("Leave cancelled");
      fetchLeaves();
    } catch {
      toast.error("Failed to cancel");
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Leaves</h1>
          <p className="text-gray-400 mt-1">{isAdmin ? "Manage leave requests" : "Your leave history"}</p>
        </div>
        {!isAdmin && (
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/25">
            <HiOutlinePlus className="w-5 h-5" /> Apply Leave
          </button>
        )}
      </div>

      {/* Apply form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-white mb-4">New Leave Request</h3>
          <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Leave Type</label>
              <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })} className={inputClass}>
                {leaveTypes.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Reason</label>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reason for leave..." rows={3} className={inputClass} required />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold">Submit</button>
            </div>
          </form>
        </div>
      )}

      {/* Leave list */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {isAdmin && <th className="text-left py-4 px-6 text-gray-400 font-medium">Employee</th>}
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">From</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">To</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Days</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    {isAdmin && (
                      <td className="py-3 px-6 text-gray-200">{leave.employee?.user?.name || "—"}</td>
                    )}
                    <td className="py-3 px-4 text-gray-300 capitalize">{leave.leaveType}</td>
                    <td className="py-3 px-4 text-gray-300">{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-gray-300">{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-gray-300">{leave.totalDays}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${statusBadge[leave.status]}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin && leave.status === "pending" && (
                          <>
                            <button onClick={() => handleAction(leave._id, "approve")} className="p-2 rounded-lg hover:bg-success/10 text-success transition-colors" title="Approve">
                              <HiOutlineCheck className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleAction(leave._id, "reject")} className="p-2 rounded-lg hover:bg-danger/10 text-danger transition-colors" title="Reject">
                              <HiOutlineX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {!isAdmin && leave.status === "pending" && (
                          <button onClick={() => handleCancel(leave._id)} className="text-xs text-danger hover:underline">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr><td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-gray-500">No leave requests found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
