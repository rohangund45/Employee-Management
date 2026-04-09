import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { employeeAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineUserGroup,
} from "react-icons/hi";

const statusColors = {
  active: "bg-success/20 text-success",
  inactive: "bg-gray-500/20 text-gray-400",
  "on-leave": "bg-warning/20 text-warning",
  terminated: "bg-danger/20 text-danger",
};

export default function Employees() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);

  const departments = [
    "Engineering", "Marketing", "Sales", "Human Resources",
    "Finance", "Operations", "Design", "Support",
  ];

  const fetchEmployees = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (department) params.department = department;

      const res = await employeeAPI.getAll(params);
      setEmployees(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [department]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees(1);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate ${name}?`)) return;
    try {
      await employeeAPI.delete(id);
      toast.success("Employee deactivated");
      fetchEmployees(pagination.page);
    } catch (err) {
      toast.error("Failed to deactivate employee");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Employees</h1>
          <p className="text-gray-400 mt-1">{pagination.total} total employees</p>
        </div>
        {isAdmin && (
          <Link
            to="/employees/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/25"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Employee
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or designation..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
          />
        </form>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-16">
            <HiOutlineUserGroup className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No employees found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Employee</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium hidden md:table-cell">ID</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium hidden lg:table-cell">Department</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium hidden lg:table-cell">Designation</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Status</th>
                    {isAdmin && <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, i) => (
                    <tr
                      key={emp._id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors animate-fadeIn"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {emp.user?.name?.charAt(0) || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-200 truncate">{emp.user?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500 truncate">{emp.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300 font-mono text-xs hidden md:table-cell">{emp.employeeId}</td>
                      <td className="py-3 px-4 text-gray-300 hidden lg:table-cell">{emp.department}</td>
                      <td className="py-3 px-4 text-gray-300 hidden lg:table-cell">{emp.designation}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${statusColors[emp.status] || "bg-gray-500/20 text-gray-400"}`}>
                          {emp.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-6">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => navigate(`/employees/${emp._id}`)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-primary-400 transition-colors" title="View">
                              <HiOutlineEye className="w-4 h-4" />
                            </button>
                            <button onClick={() => navigate(`/employees/edit/${emp._id}`)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-warning transition-colors" title="Edit">
                              <HiOutlinePencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(emp._id, emp.user?.name)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-danger transition-colors" title="Delete">
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchEmployees(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg bg-surface border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <HiOutlineChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchEmployees(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="p-2 rounded-lg bg-surface border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <HiOutlineChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
