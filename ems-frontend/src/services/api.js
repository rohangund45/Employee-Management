import axios from "axios";

const API = axios.create({
  baseURL: "https://employee-management-backend-4ths.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("ems_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ems_token");
      localStorage.removeItem("ems_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const authAPI = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
  getMe: () => API.get("/auth/me"),
  changePassword: (data) => API.put("/auth/change-password", data),
};

// ── Employees ──
export const employeeAPI = {
  getAll: (params) => API.get("/employees", { params }),
  getOne: (id) => API.get(`/employees/${id}`),
  create: (data) => API.post("/employees", data),
  update: (id, data) => API.put(`/employees/${id}`, data),
  delete: (id) => API.delete(`/employees/${id}`),
};

// ── Attendance ──
export const attendanceAPI = {
  checkIn: (data) => API.post("/attendance/check-in", data),
  checkOut: () => API.put("/attendance/check-out"),
  getMy: (params) => API.get("/attendance/my", { params }),
  getAll: (params) => API.get("/attendance/all", { params }),
  getEmployee: (id, params) => API.get(`/attendance/employee/${id}`, { params }),
  mark: (data) => API.post("/attendance/mark", data),
};

// ── Leaves ──
export const leaveAPI = {
  apply: (data) => API.post("/leaves", data),
  getMy: (params) => API.get("/leaves/my", { params }),
  getBalance: (params) => API.get("/leaves/balance", { params }),
  getAll: (params) => API.get("/leaves/all", { params }),
  approve: (id, data) => API.put(`/leaves/${id}/approve`, data),
  reject: (id, data) => API.put(`/leaves/${id}/reject`, data),
  cancel: (id) => API.delete(`/leaves/${id}`),
};

// ── Salary ──
export const salaryAPI = {
  getMy: (params) => API.get("/salary/my", { params }),
  getEmployee: (id, params) => API.get(`/salary/employee/${id}`, { params }),
  create: (data) => API.post("/salary", data),
  update: (id, data) => API.put(`/salary/${id}`, data),
  markPaid: (id) => API.put(`/salary/${id}/pay`),
  generateBulk: (data) => API.post("/salary/generate-bulk", data),
};

// ── Dashboard ──
export const dashboardAPI = {
  getStats: () => API.get("/dashboard/stats"),
  getEmployee: () => API.get("/dashboard/employee"),
};

export default API;
