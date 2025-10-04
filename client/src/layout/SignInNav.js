import React, { useState, useEffect } from "react";
import "../App.css";
import { Outlet } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
import LogoutButton from "../components/LogoutButton";

function SignInNav() {
    const [user, setUser] = useState(null);

    useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // decode token payload
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ email: payload.email }); // or fetch full profile from backend
        }
    }, []);

    return (
        <>
            <header className="w-full flex justify-end items-center p-4 bg-white dark:bg-gray-800 shadow-md shadow-gray-200 dark:shadow-gray-900">
                <div className="flex items-center gap-3">
                    {user ? (
                        <LogoutButton
                            user={user}
                            setUser={setUser}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-md transition duration-200"
                        />
                    ) : (
                        <GoogleLoginButton
                            setUser={setUser}
                            className="px-4 py-2 bg-blue-100 hover:bg-blue-700 text-black rounded-lg font-medium shadow-md transition duration-200"
                        />
                    )}
                </div>
            </header>
            <main className="p-4">
                <Outlet />
            </main>
        </>
    );
}

export default SignInNav;
