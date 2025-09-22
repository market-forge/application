import '../App.css';
import React, { useState, useEffect } from "react";
import { decryptData } from "../utils/encrypt";
import Register from "../pages/Register";
import Login from "../pages/Login";
import LogoutButton from  "../components/LogoutButton";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Hello, {user.username || user.name || user.email}
        </h1>
        <LogoutButton setUser={setUser} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        {view === "login" ? (
          <>
            <Login setUser={setUser} />
            <p className="text-center mt-4 text-gray-600 dark:text-gray-300">
              Don't have an account?{" "}
              <button
                onClick={() => setView("register")}
                className="text-blue-600 hover:underline"
              >
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            <Register setUser={setUser} />
            <p className="text-center mt-4 text-gray-600 dark:text-gray-300">
              Already have an account?{" "}
              <button
                onClick={() => setView("login")}
                className="text-blue-600 hover:underline"
              >
                Login
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  );
}

export default App;
