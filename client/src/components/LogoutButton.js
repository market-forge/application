import React from "react";

function LogoutButton({ user, setUser, onLogout }) {
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="flex items-center text-white space-x-3">
      <button
        onClick={() => {}}
        className="inline-flex items-center justify-center p-2 rounded-full
         bg-blue-500/10 hover:bg-blue-500/20
         text-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.3)]
         hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]
         transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/70"
        aria-label="User profile"
      >
        {user.picture ? (
          <img 
            src={user.picture} 
            alt={user.name}
            className="w-5 h-5 rounded-full object-cover"
          />
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </button>

      <span className="text-sm">
        {user.username || user.name || user.email}
      </span>

      <span className="text-gray-500">|</span>

      <button
        onClick={logout}
        className="px-3 py-1 text-sm text-black font-medium
         hover:text-red-400 focus:outline-none focus:ring-2
         focus:ring-offset-2 focus:ring-red-400
         transition duration-200 ease-in-out"
        aria-label="Logout"
      >
        Logout
      </button>
    </div>
  );
}

export default LogoutButton;
