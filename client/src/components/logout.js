import React from 'react';

function LogoutButton({ setUser }) {
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return <button onClick={logout}>Logout</button>;
}

export default LogoutButton;
