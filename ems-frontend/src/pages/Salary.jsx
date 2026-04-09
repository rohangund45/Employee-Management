import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { salaryAPI } from "../services/api";
import toast from "react-hot-toast";
import { HiOutlineCurrencyDollar, HiOutlineCheck, HiOutlinePlus } from "react-icons/hi";

const paymentBadge = {
  pending: "bg-warning/20 text-warning",
  paid: "bg-success/20 text-success",
  "on-hold": "bg-danger/20 text-danger",
};

export default function Salary() {
  const { isAdmin } = useAuth();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showBulk, setShowBulk] = useState(false);
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth() + 1);
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const res = await salaryAPI.getMy({ year });
      setSalaries(res.data.data);
    } catch (err) {
      console.error("Salary fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to load salary records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalaries(); }, [year]);

  const handleBulkGenerate = async () => {
    try {
      const res = await salaryAPI.generateBulk({ month: bulkMonth, year: bulkYear });
      toast.success(res.data.message);
      setShowBulk(false);
      fetchSalaries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk generation failed");
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await salaryAPI.markPaid(id);
      toast.success("Marked as paid");
      fetchSalaries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark as paid");
    }
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Salary</h1>
          <p className="text-gray-400 mt-1">{isAdmin ? "Manage payroll records" : "Your payroll history"}</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button onClick={() => setShowBulk(!showBulk)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/25 text-sm">
              <HiOutlinePlus className="w-4 h-4" /> Generate Bulk
            </button>
          )}
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="px-4 py-2.5 rounded-xl bg-surface-light border border-white/10 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk generate form */}
      {showBulk && isAdmin && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-white mb-4">Generate Bulk Salary</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Month</label>
              <select value={bulkMonth} onChange={(e) => setBulkMonth(Number(e.target.value))}
                className="px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Year</label>
              <select value={bulkYear} onChange={(e) => setBulkYear(Number(e.target.value))}
                className="px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={handleBulkGenerate}
              className="px-6 py-2.5 rounded-xl bg-success/20 text-success font-semibold hover:bg-success/30 transition-all">
              Generate
            </button>
            <button onClick={() => setShowBulk(false)}
              className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : salaries.length === 0 ? (
          <div className="text-center py-16">
            <HiOutlineCurrencyDollar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No salary records for {year}</p>
            {isAdmin && <p className="text-gray-500 text-sm mt-2">Use "Generate Bulk" to create salary records for all employees</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {isAdmin && <th className="text-left py-4 px-6 text-gray-400 font-medium">Employee</th>}
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Month</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Basic</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium hidden md:table-cell">Allowances</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium hidden md:table-cell">Deductions</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Net Salary</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Status</th>
                  {isAdmin && <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {salaries.map((sal) => (
                  <tr key={sal._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    {isAdmin && (
                      <td className="py-3 px-6 text-gray-200">
                        {sal.employee?.user?.name || "—"}
                      </td>
                    )}
                    <td className="py-3 px-4 text-gray-200 font-medium">{months[sal.month - 1]} {sal.year}</td>
                    <td className="py-3 px-4 text-gray-300">₹{sal.basicSalary?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-success hidden md:table-cell">+₹{sal.totalAllowances?.toLocaleString() || "0"}</td>
                    <td className="py-3 px-4 text-danger hidden md:table-cell">-₹{sal.totalDeductions?.toLocaleString() || "0"}</td>
                    <td className="py-3 px-4 text-white font-semibold">₹{sal.netSalary?.toLocaleString() || sal.basicSalary?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${paymentBadge[sal.paymentStatus]}`}>
                        {sal.paymentStatus}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-6 text-right">
                        {sal.paymentStatus === "pending" && (
                          <button onClick={() => handleMarkPaid(sal._id)}
                            className="p-2 rounded-lg hover:bg-success/10 text-success transition-colors" title="Mark as Paid">
                            <HiOutlineCheck className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
