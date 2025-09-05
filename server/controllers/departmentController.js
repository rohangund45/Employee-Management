import Department from "../models/Department.js";

// ✅ GET all departments
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    return res.status(200).json({ success: true, departments });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Get department server error" });
  }
};

// ✅ POST: Add new department
const addDepartment = async (req, res) => {
  try {
    const { dep_name, description } = req.body;

    // Optional: Check if department already exists
    const existingDep = await Department.findOne({ dep_name });
    if (existingDep) {
      return res.status(400).json({ success: false, error: "Department already exists" });
    }

    const newDep = new Department({
      dep_name,
      description
    });

    await newDep.save();

    return res.status(200).json({ success: true, department: newDep });
  } catch (error) {
    console.error("Add department error:", error);
    return res.status(500).json({ success: false, error: "Add department server error" });
  }
};

const getDepartment = async(req, res) =>{
    try{
        const {id} = req.params;
        const department = await Department.findById({_id: id})
        return res.status(200).json({ success: true, department});
       } catch (error) {
        return res.status(500).json({ success: false, error: "Get department server error" });
    }
}

const updateDepartment = async (req, res) => {
    try{
        const {id} = req.params;
        const {dep_name, description} = req.body;   
        const updateDep = await Department.findByIdAndUpdate({_id: id}, {
            dep_name,
            description
        })
        return res.status(200).json({ success: true, updateDep});
       } catch (error) {
        return res.status(500).json({ success: false, error: "Edit department server error" });
    }
}

const deleteDepartment = async (req, res) => {
    try{
        const {id} = req.params;   
        const deleteDep = await Department.findByIdAndDelete({_id: id})
        return res.status(200).json({ success: true, deleteDep});
       } catch (error) {
        return res.status(500).json({ success: false, error: "Delete department server error" });
    }
}

export { addDepartment, getDepartments, getDepartment, updateDepartment, deleteDepartment };
