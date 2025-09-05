import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { DepartmentButtons } from '../../utils/DepartmentHelper';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]); // ✅ Capital F
  const [depLoading, setDepLoading] = useState(false);

  const onDepartmentDelete = (id) => {
    const filtered = departments.filter(dep => dep._id !== id);
    setDepartments(filtered);
    setFilteredDepartments(filtered); // ✅ Also update filtered list
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      setDepLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/department', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data.success) {
          let sno = 1;
          const data = response.data.departments.map(dep => ({
            ...dep,
            sno: sno++,
          }));

          setDepartments(data);
          setFilteredDepartments(data); // ✅ Fixed case
        }
      } catch (error) {
        console.error('Fetch departments error:', error);
        alert("Failed to fetch departments.");
      } finally {
        setDepLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const columns = [
    {
      name: "S No",
      selector: (row) => row.sno,
    },
    {
      name: "Department Name",
      selector: (row) => row.dep_name,
      sortable: true
    },
    {
      name: "Action",
      cell: (row) => (
        <DepartmentButtons id={row._id} onDepartmentDelete={onDepartmentDelete} />
      ),
    },
  ];

  const filterDepartments = (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = departments.filter(dep =>
      dep.dep_name.toLowerCase().includes(value)
    );
    setFilteredDepartments(filtered); // ✅ Fixed case
  };

  return (
    <div className="p-5">
      {depLoading ? (
        <div className="text-center text-xl">Loading...</div>
      ) : (
        <>
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold">Manage Departments</h3>
          </div>

          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search by Dept Name"
              className="px-4 py-1 border rounded"
              onChange={filterDepartments}
            />
            <Link
              to="/admin-dashboard/add-department"
              className="px-4 py-1 bg-teal-600 rounded text-white"
            >
              Add New Department
            </Link>
          </div>

          <DataTable
            columns={columns}
            data={filteredDepartments}
            pagination
            highlightOnHover
            responsive
            striped
          />
        </>
      )}
    </div>
  );
};

export default DepartmentList;
