import React, { useState } from "react";
import axios from "axios";
// import { encryptData } from "../utils/encrypt";
import GoogleLoginButton from "../components/GoogleLoginButton";

function Register({ setUser }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:8000/auth/register", { username, email, password });
      const user = res.data.user;

      // Optionally login automatically
      setUser(user);
      alert("Registration successful. Please login.");
    } catch (err) {
      console.error("Registration failed:", err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Register</h2>

      <label className="block mb-3">
        <span className="sr-only">Username</span>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 
                     dark:bg-slate-900 dark:text-slate-100"
          type="text"
          aria-label="Username"
        />
      </label>

      <label className="block mb-3">
        <span className="sr-only">Email</span>
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 
                     dark:bg-slate-900 dark:text-slate-100"
          type="email"
          aria-label="Email"
        />
      </label>

      <label className="block mb-4">
        <span className="sr-only">Password</span>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-400 
                     dark:bg-slate-900 dark:text-slate-100"
          aria-label="Password"
        />
      </label>

      <button
        onClick={handleRegister}
        className="w-full mb-4 inline-flex items-center justify-center gap-2 px-4 py-3 
                   bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Register"
      >
        Sign Up
      </button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-3">
        OR
      </p>

      <div className="flex justify-center">
        <GoogleLoginButton setUser={setUser} />
      </div>
    </div>
  );
}

export default Register;
