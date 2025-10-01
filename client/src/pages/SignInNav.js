import React, { useState } from "react";
import "../App.css";
import GoogleLoginButton from "../components/GoogleLoginButton";
import LogoutButton from "../components/LogoutButton";

function SignInNav() {
  const [user, setUser] = useState(null);

  return (
    <div className="w-full flex justify-end items-center p-4 bg-gray-50 dark:bg-gray-700">
      {user ? (//user is true
        <LogoutButton user={user} setUser={setUser} />
      ) : ( // else
        <GoogleLoginButton setUser={setUser} />
      )}
    </div>
  );
}

export default SignInNav;
