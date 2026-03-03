import React, { useState } from 'react'
import { loginApi } from './service';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async () => {    
      try {
        const data = await loginApi(email, password);
        console.log(data);

        localStorage.setItem("access_token", data.access_token);
    } catch (error) {
        console.error("Login failed");
    }
    }
    
  return (
   <>
   <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
     
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" type="email" id="email" onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
          <input className="w-full px-3 py-2 border border-gray-300 rounded-lg" type="password" id="password" onChange={(e) => setPassword(e.target.value)}/>
        </div>
        <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600" type="submit" onClick={handleSubmit}>Login</button>
      
    </div>
   </div>
   </>
  )
}

export default Login