import React from "react";

function LogoutButton({ setUser }) {
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.open("http://localhost:3000", "_self");
  };

  return <button onClick={logout}>Logout</button>;
}

export default LogoutButton;
