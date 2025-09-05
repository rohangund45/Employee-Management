import React from 'react';
import { useAuth } from '../../../context/authContext'; // ✅ fixed import

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className='flex justify-between items-center h-16 bg-teal-600 px-6 text-white shadow-md'>
      <p className="text-lg">Welcome {user?.name}</p>
      <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded">
        Logout
      </button>
    </div>
  );
};

export default Navbar;
