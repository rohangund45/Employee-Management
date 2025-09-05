import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddDepartment = () => {
  const [department, setDepartment] = useState({
    dep_name: '',
    description: '' // ✅ using "description"
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment({ ...department, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/department/add', department, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        navigate('/admin-dashboard/departments');
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error);
      } else {
        alert("Something went wrong");
        console.error("Unknown error:", error);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md w-96">
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Department</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="dep_name" className="block text-sm font-medium text-gray-700 mb-1">
            Department Name
          </label>
          <input
            type="text"
            name="dep_name"
            id="dep_name"
            value={department.dep_name}
            onChange={handleChange}
            placeholder="Enter Department Name"
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows="4"
            value={department.description}
            onChange={handleChange}
            placeholder="Enter description..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-semibold transition"
        >
          Add Department
        </button>
      </form>
    </div>
  );
};

export default AddDepartment;
