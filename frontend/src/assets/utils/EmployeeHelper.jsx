import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const columns = [
    {
        name: "S No",
        selector: row => row.sno,
        width: "90px",
    },
    {
        name: "Name",
        selector: row => row.name,
        sortable: true,
        width: "200px",
    },
    {
        name: "Image",
        selector: row => row.profileImage,
        cell: row => (
        <img
            src={`http://localhost:3000/uploads/${row.profileImage}`}
            alt="profile"
            className="w-12 h-12 rounded-full object-cover"
        />
        ),
        width: "140px",
    },
    {
        name: "Department",
        selector: row => row.dep_name,
        sortable: true,
        width: "200px",
    },
    {
        name: "DOB",
        selector: row => row.dob,
        sortable: true,
        width: "180px",
    },
    {
        name: "Action",
        cell: row => <EmployeeButtons Id={row._id} />,
        width: "360px",
    },
];



export const fetchDepartments = async () => {
    let departments
      try {
        const response = await axios.get('http://localhost:3000/api/department', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data.success) {
            departments = response.data.departments
        }
      } catch (error) {
        console.error('Fetch departments error:', error);
        alert("Failed to fetch departments.");
      } 
      return departments
    };


    export const EmployeeButtons = ({ Id }) => {
        const navigate = useNavigate();

        
        return (
            <div className="flex gap-2">
            <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                onClick={() => navigate(`/admin-dashboard/employees/${Id}`)}
            >
                View
            </button>

            <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                onClick={() => navigate(`/admin-dashboard/employees/edit/${Id}`)}
            >
                Edit
            </button>

            <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
                Salary
            </button>

            <button
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
                Leave
            </button>
            </div>
        );
        };