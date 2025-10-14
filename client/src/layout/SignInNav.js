import React, { useState, useEffect } from "react";
import "../App.css";
import { Outlet } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
import UserDropdown from "../components/UserDropdown";

import { useLocation, useNavigate } from "react-router-dom";

function useAuthCallback(setUser) {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        if (code) {
            // Exchange code for token on your server
            fetch(`${process.env.REACT_APP_SERVER_URL}/api/oauth/callback?code=${code}`)
                .then(res => res.json())
                .then(data => {
                    localStorage.setItem("token", data.token);
                    try {
                        const payload = JSON.parse(atob(data.token.split(".")[1]));
                        setUser({
                            name: payload.name || payload.full_name,
                            email: payload.email,
                            picture: payload.picture
                        });
                    } catch (err) {
                        console.error("Failed to decode token:", err);
                    }
                    navigate("/"); // Remove code from URL
                })
                .catch(err => console.error(err));
        }
    }, [location.search, setUser, navigate]);
}

function SignInNav() {
    const [user, setUser] = useState(null);
    // console.log("Current user:", user);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // decode token payload
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUser({
                name: payload.name || payload.full_name,
                email: payload.email,
                picture: payload.picture
            });
        }
    }, []);

    useAuthCallback(setUser);

    return (
        <>
            <header className="w-full flex justify-end items-center p-4 bg-white dark:bg-gray-800 shadow-md shadow-gray-200 dark:shadow-gray-900">
                <div className="flex items-center gap-3">
                    {user ? (
                        <UserDropdown
                            user={user}
                            setUser={setUser}
                        />
                    ) : (
                        <GoogleLoginButton
                            setUser={setUser}
                            className="px-4 py-2 bg-blue-200 hover:bg-blue-700 text-black rounded-lg font-medium shadow-md transition duration-200"
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