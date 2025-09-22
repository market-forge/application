import React, { useState } from "react";
import axios from "axios";
import { encryptData } from "../utils/encrypt";
import GoogleLoginButton from "../components/GoogleLoginButton";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:3000", { email, password });
      const { token, user } = res.data;

      // Store JWT encrypted
      localStorage.setItem("user", encryptData({ token, user }));
      setUser(user);
    } catch (err) {
      console.error("Login failed:", err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <p>Or login with Google</p>
      <GoogleLoginButton setUser={setUser} />
    </div>
  );
}

export default Login;
