import React from "react";
import { GoogleLogin } from "@react-oauth/google";
// import jwt_decode from "jwt-decode";
import { jwtDecode } from "jwt-decode";
import { encryptData } from "../utils/encrypt";

function GoogleLoginButton({ setUser }) {
  const onSuccess = (credentialResponse) => {
    try {
      const userObject = jwtDecode(credentialResponse.credential);
      localStorage.setItem("user", encryptData({ token: credentialResponse.credential, user: userObject }));
      setUser(userObject);
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  const onError = () => console.log("Google login failed");

  return <GoogleLogin onSuccess={onSuccess} onError={onError} />;
}

export default GoogleLoginButton;
