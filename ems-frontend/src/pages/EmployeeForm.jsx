import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { employeeAPI } from "../services/api";
import toast from "react-hot-toast";
import { HiOutlineArrowLeft } from "react-icons/hi";

const departments = [
  "Engineering", "Marketing", "Sales", "Human Resources",
  "Finance", "Operations", "Design", "Support",
];

const initialForm = {
  name: "", email: "", password: "", department: "", designation: "",
  phone: "", dateOfBirth: "", dateOfJoining: new Date().toISOString().split("T")[0],
  street: "", city: "", state: "", zipCode: "", country: "India",
  basic: "", allowances: "0", deductions: "0",
};

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      employeeAPI.getOne(id).then((res) => {
        const emp = res.data.data;
        setForm({
          name: emp.user?.name || "",
          email: emp.user?.email || "",
          password: "",
          department: emp.department || "",
          designation: emp.designation || "",
          phone: emp.phone || "",
          dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split("T")[0] : "",
          dateOfJoining: emp.dateOfJoining ? emp.dateOfJoining.split("T")[0] : "",
          street: emp.address?.street || "",
          city: emp.address?.city || "",
          state: emp.address?.state || "",
          zipCode: emp.address?.zipCode || "",
          country: emp.address?.country || "India",
          basic: emp.salary?.basic?.toString() || "0",
          allowances: emp.salary?.allowances?.toString() || "0",
          deductions: emp.salary?.deductions?.toString() || "0",
        });
        setFetchLoading(false);
      }).catch(() => {
        toast.error("Employee not found");
        navigate("/employees");
      });
    }
  }, [id, isEdit, navigate]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      email: form.email,
      ...(form.password && { password: form.password }),
      department: form.department,
      designation: form.designation,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth,
      dateOfJoining: form.dateOfJoining,
      address: {
        street: form.street, city: form.city, state: form.state,
        zipCode: form.zipCode, country: form.country,
      },
      salary: {
        basic: Number(form.basic),
        allowances: Number(form.allowances),
        deductions: Number(form.deductions),
      },
    };

    try {
      if (isEdit) {
        await employeeAPI.update(id, payload);
        toast.success("Employee updated successfully");
      } else {
        await employeeAPI.create(payload);
        toast.success("Employee created successfully");
      }
      navigate("/employees");
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <button onClick={() => navigate("/employees")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Employees
      </button>

      <h1 className="text-3xl font-bold text-white mb-2">{isEdit ? "Edit Employee" : "Add New Employee"}</h1>
      <p className="text-gray-400 mb-8">{isEdit ? "Update employee information" : "Fill in the details to create a new employee"}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input type="text" value={form.name} onChange={update("name")} placeholder="John Doe" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" value={form.email} onChange={update("email")} placeholder="john@company.com" className={inputClass} required />
            </div>
            {!isEdit && (
              <div>
                <label className={labelClass}>Password</label>
                <input type="password" value={form.password} onChange={update("password")} placeholder="Default: Employee@123" className={inputClass} />
              </div>
            )}
            <div>
              <label className={labelClass}>Phone *</label>
              <input type="text" value={form.phone} onChange={update("phone")} placeholder="+91 9876543210" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Date of Birth *</label>
              <input type="date" value={form.dateOfBirth} onChange={update("dateOfBirth")} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Date of Joining *</label>
              <input type="date" value={form.dateOfJoining} onChange={update("dateOfJoining")} className={inputClass} required />
            </div>
          </div>
        </div>

        {/* Job Info */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Job Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department *</label>
              <select value={form.department} onChange={update("department")} className={inputClass} required>
                <option value="">Select Department</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Designation *</label>
              <input type="text" value={form.designation} onChange={update("designation")} placeholder="Software Engineer" className={inputClass} required />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Street</label>
              <input type="text" value={form.street} onChange={update("street")} placeholder="123 Main St" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input type="text" value={form.city} onChange={update("city")} placeholder="Mumbai" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input type="text" value={form.state} onChange={update("state")} placeholder="Maharashtra" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Zip Code</label>
              <input type="text" value={form.zipCode} onChange={update("zipCode")} placeholder="400001" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input type="text" value={form.country} onChange={update("country")} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Salary Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Basic Salary (₹) *</label>
              <input type="number" value={form.basic} onChange={update("basic")} placeholder="50000" className={inputClass} required min="0" />
            </div>
            <div>
              <label className={labelClass}>Allowances (₹)</label>
              <input type="number" value={form.allowances} onChange={update("allowances")} placeholder="0" className={inputClass} min="0" />
            </div>
            <div>
              <label className={labelClass}>Deductions (₹)</label>
              <input type="number" value={form.deductions} onChange={update("deductions")} placeholder="0" className={inputClass} min="0" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate("/employees")} className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-medium">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold hover:from-primary-500 hover:to-primary-400 transition-all disabled:opacity-50 shadow-lg shadow-primary-500/25">
            {loading ? "Saving..." : isEdit ? "Update Employee" : "Create Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}
