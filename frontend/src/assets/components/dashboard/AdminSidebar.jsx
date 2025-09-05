
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaCalendarAlt,
  FaCogs,
  FaMoneyBillWave,
} from 'react-icons/fa';

const AdminSidebar = () => {
  return (
    <div className="bg-gray-800 text-white h-screen fixed left-0 top-0 bottom-0 w-64 p-4 space-y-6 shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 h-16 flex items-center justify-center shadow-md">
        <h3 className="text-3xl font-poppins font-extrabold text-white tracking-wide">
          Employee MS
        </h3>
      </div>

      {/* Sidebar Links */}
      <div className="flex flex-col gap-4">
        <NavLink
          to="/admin-dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 text-white hover:bg-gray-700 p-2 rounded ${
              isActive ? 'bg-teal-500' : ''
            }`
          }
          end
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin-dashboard/employees"
          className={({ isActive }) =>
            `flex items-center gap-3 text-white hover:bg-gray-700 p-2 rounded ${
              isActive ? 'bg-teal-500' : ''
            }`
          }
        >
          <FaUsers />
          <span>Employees</span>
        </NavLink>

        <NavLink
          to="/admin-dashboard/departments"
          className={({ isActive }) =>
            `flex items-center gap-3 text-white hover:bg-gray-700 p-2 rounded ${
              isActive ? 'bg-teal-500' : ''
            }`
          }
        >
          <FaBuilding />
          <span>Departments</span>
        </NavLink>

        <NavLink
          to="/admin-dashboard"
          className="flex items-center gap-3 text-white hover:bg-gray-700 p-2 rounded"
        >
          <FaCalendarAlt />
          <span>Leave</span>
        </NavLink>

        <NavLink
          to="/admin-dashboard"
          className="flex items-center gap-3 text-white hover:bg-gray-700 p-2 rounded"
        >
          <FaMoneyBillWave />
          <span>Salary</span>
        </NavLink>

        <NavLink
          to="/admin-dashboard"
          className="flex items-center gap-3 text-white hover:bg-gray-700 p-2 rounded"
        >
          <FaCogs />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;
