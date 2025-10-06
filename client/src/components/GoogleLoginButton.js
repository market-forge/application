import React from "react";

console.log("Entering GoogleLoginButton.js");
console.log("Server URL:", process.env.REACT_APP_SERVER_URL);
console.log("Client URL:", process.env.REACT_APP_CLIENT_URL);

function GoogleLoginButton() {
  const handleLogin = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/oauth/url`);
      const data = await res.json();
      console.log("Redirecting to:", data.url);
      window.location.href = data.url; // send user to Google login
    } catch (err) {
      console.error("Login request failed:", err);
    }
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
