import './App.css';
import GeminiTester from "./GeminiTester";

import React, { useState, useEffect } from "react";
import { decryptData } from "./utils/encrypt";
import Register from "./pages/Register";
import Login from "./pages/Login";
import GitHubLoginButton from "./components/GitHubLoginButton";
import LogoutButton from "./components/LogoutButton";

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login"); // "login" or "register"

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const decrypted = decryptData(stored);
      if (decrypted?.user) setUser(decrypted.user);
    }

    const params = new URLSearchParams(window.location.search);
    const userData = params.get("user"); // For GitHub OAuth
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      localStorage.setItem("user", JSON.stringify(parsed)); // can encrypt if desired
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  if (user) {
    return (
      <div>
        <h1>Hello, {user.username || user.name || user.email}</h1>
        <LogoutButton setUser={setUser} />
      </div>
    );
  }

  return (
    <div>
      {view === "login" ? (
        <>
          <Login setUser={setUser} />
          <p>
            Don't have an account? <button onClick={() => setView("register")}>Register</button>
          </p>
        </>
      ) : (
        <>
          <Register setUser={setUser} />
          <p>
            Already have an account? <button onClick={() => setView("login")}>Login</button>
          </p>
        </>
      )}
      <GitHubLoginButton />

      <div className="App">
        <GeminiTester/>
    </div>
    </div>
    
  );
}

export default App;
