import React from "react";

function GitHubLoginButton() {
  const loginWithGitHub = () => {
    window.open("http://localhost:3000", "_self");
  };

  return <button onClick={loginWithGitHub}>Login with GitHub</button>;
}

export default GitHubLoginButton;
