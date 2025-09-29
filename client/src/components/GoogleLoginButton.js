import React from "react";
import { GoogleLogin } from "@react-oauth/google";
// import jwt_decode from "jwt-decode";
import { jwtDecode } from "jwt-decode";

function GoogleLoginButton({ setUser }) {

  const onSuccess = (credentialResponse) => {
      const userObject = jwtDecode(credentialResponse.credential);
      setUser(userObject); //will use it to collect user login information
  };

  const onError = () => console.log("Google login failed");

  return <GoogleLogin onSuccess={onSuccess} onError={onError} />;
}

export default GoogleLoginButton;
