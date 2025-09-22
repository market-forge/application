import React from "react";
import { FaGithub } from "react-icons/fa";

function GitHubLoginButton() {
  const loginWithGitHub = () => {
    window.open("http://localhost:8000/auth/github", "_self");
  };

  return (
    <button
      onClick={loginWithGitHub}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 
                 bg-gray-600 hover:bg-gray-900 text-white font-medium rounded-lg shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-gray-600 transition"
      aria-label="Login with GitHub"
    >
      <FaGithub className="text-xl" />
      Sign in with GitHub
    </button>
  );
}

export default GitHubLoginButton;
