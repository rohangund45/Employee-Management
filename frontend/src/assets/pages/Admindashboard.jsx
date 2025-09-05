import React from 'react';
import { useAuth } from '../../context/authContext';
import AdminSidebar from '../components/dashboard/AdminSidebar';
import Navbar from '../components/dashboard/Navbar';
import { Outlet } from 'react-router-dom'; // ✅ Required for nested routes

const Admindashboard = () => {
  const { user } = useAuth();

  return (
    <div className='flex'>
      <AdminSidebar />
      <div className='flex-1 ml-64 bg-gray-100 min-h-screen'>
        <Navbar />
        <div className='p-6'>
          <Outlet /> {/* ✅ This renders the nested routes like AdminSummary */}
        </div>
      </div>
    </div>
  );
};

export default Admindashboard;
