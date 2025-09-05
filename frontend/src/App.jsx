import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './assets/pages/Login';
import Admindashboard from "./assets/pages/Admindashboard";
import Employeedashboard from "./assets/pages/Employeedashboard";
import PrivateRoutes from './assets/utils/PrivateRoutes';
import AdminSummary from "./assets/components/dashboard/AdminSummary";
import DepartmentList from "./assets/components/department/DepartmentList";
import AddDepartment from "./assets/components/department/AddDepartment";
import EditDepartment from "./assets/components/department/EditDepartment";
import List from "./assets/components/employee/List";
import Add from "./assets/components/employee/Add";
import View from "./assets/components/employee/View";
import Edit from "./assets/components/employee/Edit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Layout */}
        <Route 
          path="/admin-dashboard"
          element={
            <PrivateRoutes>
              <Admindashboard />
            </PrivateRoutes>
          }
        >
          <Route index element={<AdminSummary />} />
          <Route path="departments" element={<DepartmentList />} />
          <Route path="add-department" element={<AddDepartment />} />
          <Route path="department/:id" element={<EditDepartment />} />
          <Route path="employees" element={<List />} />
          <Route path="add-employee" element={<Add />} />
          <Route path="employees/:id" element={<View />} />
          <Route path="employees/edit/:id" element={<Edit />} />

        </Route>

        {/* Employee Dashboard */}
        <Route 
          path="/employee-dashboard"
          element={
            <PrivateRoutes>
              <Employeedashboard />
            </PrivateRoutes>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
