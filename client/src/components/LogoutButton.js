import React from "react";

function LogoutButton({ setUser }) {
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.open("http://localhost:8000/auth/logout", "_self");
  };

  return (
    <button
      onClick={logout}
      className="w-full max-w-xs mx-auto mt-4 px-4 py-3 bg-red-600 hover:bg-red-700 
                 text-white font-medium rounded-lg shadow-md flex items-center justify-center 
                 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      aria-label="Logout"
    >
      Logout
    </button>
  );
}

export default LogoutButton;
