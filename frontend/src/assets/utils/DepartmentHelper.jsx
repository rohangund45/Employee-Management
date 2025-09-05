import axios from "axios";
import { useNavigate } from "react-router-dom";

export const DepartmentButtons = ({ id, onDepartmentDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Do you want to Delete?");
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`http://localhost:3000/api/department/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        onDepartmentDelete(id);
      }
    } catch (error) {
      console.error('Delete department error:', error);
      alert("Failed to delete department.");
    }
  };

  return (
    <div className="flex gap-2">
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
        onClick={() => navigate(`/admin-dashboard/department/${id}`)}
      >
        Edit
      </button>
      <button
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
};
