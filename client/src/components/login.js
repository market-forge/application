import React from 'react';
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function LoginButton({ setUser }) {
  const onSuccess = (credentialResponse) => {
    try {
      if (!credentialResponse || !credentialResponse.credential) {
        console.error("No credential received from Google.");
        return;
      }

      const userObject = jwtDecode(credentialResponse.credential);
      console.log("Decoded User:", userObject);

      localStorage.setItem("user", JSON.stringify(userObject));
      setUser(userObject);
    } catch (err) {
      console.error("Failed to decode JWT:", err);
    }
  };

  const onError = () => {
    console.log("Login Failed");
  };

  return <GoogleLogin onSuccess={onSuccess} onError={onError} />;
}

export default LoginButton;
