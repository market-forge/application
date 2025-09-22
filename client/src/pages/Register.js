import React, { useState } from "react";
import axios from "axios";
import { encryptData } from "../utils/encrypt";
import GoogleLoginButton from "../components/GoogleLoginButton";

function Register({ setUser }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:3000", { username, email, password });
      const user = res.data.user;

      // Optionally login automatically and store token
      setUser(user);
      alert("Registration successful. Please login.");
    } catch (err) {
      console.error("Registration failed:", err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
      <p>Or sign up with Google</p>
      <GoogleLoginButton setUser={setUser} />
    </div>
  );
}

export default Register;
