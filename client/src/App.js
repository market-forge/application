import './App.css';
import GeminiTester from "./GeminiTester";
import React, { useState, useEffect } from "react";
import { decryptData } from "./utils/encrypt";
import LogoutButton from "./components/LogoutButton";
import Account from "./account/Account";

function App() {
  const [user, setUser] = useState(null);

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
      <Account />
      <div className="App">
      
        <GeminiTester />
      </div>
    </div>
    
  );
}

export default App;
