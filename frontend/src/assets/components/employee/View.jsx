import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const View = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/employee/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setEmployee(response.data.employee);
      } else {
        console.error("Employee fetch failed:", response.data.error);
        alert("Employee not found.");
      }
    } catch (error) {
      console.error("Error fetching employee:", error);
      alert("Employee not found or deleted.");
    }
  };

  fetchEmployee();
}, [id]);


  if (!employee) return <div className="text-center mt-10">Loading...</div>;

  // Image fallback
  const imageUrl = employee?.userId?.profileImage
  ? `http://localhost:3000/uploads/${employee.userId.profileImage}`
  : '/default-profile.jpg';

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-8 text-center">Employee Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="flex justify-center">
          <img
            src={imageUrl}
            alt="Profile"
            className="rounded-full border w-64 h-64 object-cover"
          />
        </div>

        <div className="space-y-4">
          <div className="flex space-x-3">
            <p className="text-lg font-bold">Name:</p>
            <p className="font-medium">{employee?.userId?.name || "N/A"}</p>
          </div>

          <div className="flex space-x-3">
            <p className="text-lg font-bold">Employee ID:</p>
            <p className="font-medium">{employee.employeeId}</p>
          </div>

          <div className="flex space-x-3">
            <p className="text-lg font-bold">Date of Birth:</p>
            <p className="font-medium">
              {employee.dob ? new Date(employee.dob).toLocaleDateString() : "N/A"}
            </p>
          </div>

          <div className="flex space-x-3">
            <p className="text-lg font-bold">Gender:</p>
            <p className="font-medium">{employee.gender || "N/A"}</p>
          </div>

          <div className="flex space-x-3">
            <p className="text-lg font-bold">Department:</p>
            <p className="font-medium">{employee?.department?.dep_name || "N/A"}</p>
          </div>

          <div className="flex space-x-3">
            <p className="text-lg font-bold">Marital Status:</p>
            <p className="font-medium">{employee.maritalStatus || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default View;
