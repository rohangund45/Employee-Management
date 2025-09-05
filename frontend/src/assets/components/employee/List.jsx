import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { columns } from '../../utils/EmployeeHelper';
import DataTable from 'react-data-table-component';
import axios from 'axios';

const List = () => {
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [filteredEmployee, setFilteredEmployee] = useState([])

  useEffect(() => {
    const fetchEmployees = async () => {
      setEmpLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/employee', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data.success) {
          let sno = 1;
          const data = response.data.employees.map((emp) => ({
            _id: emp._id,
            sno: sno++,
            dep_name: emp.department?.dep_name || 'N/A',
            name: emp.userId?.name || 'N/A',
            dob: emp.dob ? new Date(emp.dob).toLocaleDateString() : 'N/A',
            profileImage: emp.userId?.profileImage || '',
          }));
          setEmployees(data);
          setFilteredEmployee(data);
        } else {
          console.error("Unexpected API response:", response.data);
          alert("Failed to fetch employees.");
        }
      } catch (error) {
        console.error("Fetch employees error:", error);
        alert("Something went wrong while fetching employees");
      } finally {
        setEmpLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleFilter = (e) => {
    const records = employees.filter((emp) => (
        emp.name.toLowerCase().includes(e.target.value.toLowerCase())
    ))
    setFilteredEmployee(records)
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-800">Manage Employees</h3>
      </div>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by Dept Name"
          className="px-4 py-2 border rounded w-1/3"
          onChange={handleFilter}
        />
        <Link
          to="/admin-dashboard/add-employee"
          className="px-6 py-2 bg-teal-600 rounded text-white font-semibold"
        >
          Add New Employee
        </Link>
      </div>

      <div className="overflow-x-auto shadow border rounded-lg">
        <DataTable
          columns={columns}
          data={filteredEmployee}
          progressPending={empLoading}
          pagination
          highlightOnHover
          striped
          fixedHeader
          responsive
        />
      </div>
    </div>
  );
};

export default List;
