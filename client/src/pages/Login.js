import React, { useState } from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";

function Login({ setUser }) {

  return (
    
  <div className="max-w-md mx-auto mt-12 p-6 bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-lg">
    <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Login</h2>

    <div className="flex justify-center">
      <GoogleLoginButton setUser={setUser} />
    </div>

  </div>

  );
}

export default Login;
