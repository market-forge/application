import React from "react";

function GoogleLoginButton() {
  const handleLogin = async () => {
    const res = await fetch("http://localhost:8000/api/oauth/url");
    const data = await res.json();
    window.location.href = data.url; // send user to Google login
  };

  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-blue-100 hover:bg-blue-500 text-black rounded-lg font-medium shadow-md transition duration-200"
    >
      Sign In
    </button>
  );
}

export default GoogleLoginButton;
