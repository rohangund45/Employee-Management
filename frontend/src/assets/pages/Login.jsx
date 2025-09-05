// import React, { useState } from 'react';
// import axios from 'axios';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = async(e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post("http://localhost:3000/api/auth/login", {
//         email,
//         password
//       });
//       console.log("✅ Login success:", response.data);
//     } catch (error) {
//       console.log("❌ Login failed:", error.response?.data || error);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center h-screen justify-center bg-gradient-to-b from-teal-600 from-50% to-gray-100 to-50% space-y-6">
//       <h2 className="font-pacific text-3xl text-white">Employee Management System</h2>
//       <div className="border shadow p-6 w-80 bg-white">
//         <h2 className="text-2xl font-bold mb-4">Login</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-gray-700">Email</label>
//             <input
//               type="email"
//               className="w-full px-3 py-2 border"
//               placeholder="Enter Email"
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-gray-700">Password</label>
//             <input
//               type="password"
//               className="w-full px-3 py-2 border"
//               placeholder="*******"
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>

//           <button type="submit" className="w-full bg-teal-600 text-white py-2">Login</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext'; 


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const[error, setError] = useState(null)
  const {login} = useAuth()
  const navigate = useNavigate()
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
        rememberMe, // optional: only if backend handles it
      });
      if(response.data.success){
        login(response.data.user)
        localStorage.setItem("token", response.data.token)
        if(response.data.user.role ==="admin"){
            navigate('/admin-dashboard')
        }else{
            navigate('/employee-dashboard')
        }
      }
    } catch (error) {
      if(error.response && !error.response.data.success){
        setError(error.response.data.error)
      }else{
        setError("Server Error")
      }
    }
  };

  return (
    <div className="flex flex-col items-center h-screen justify-center bg-gradient-to-b from-teal-600 from-50% to-gray-100 to-50% space-y-6">
      <h2 className="font-pacific text-3xl text-white">Employee Management System</h2>
      <div className="border shadow p-6 w-80 bg-white rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded"
              placeholder="*******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                className="mr-2"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember Me
            </label>
            <a href="/forgot-password" className="text-sm text-teal-600 hover:underline">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
   