import React from "react";

function LogoutButton({ user, setUser }) {
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <p>
      {user.username || user.name || user.email} |

      <button
        onClick={logout}
        className="mt-4 px-3 py-1
                  text-gray-700 dark:text-gray-200 font-medium
                  hover:border-red-500 hover:text-red-500
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400
                  transition duration-200 ease-in-out"
        aria-label="Logout"
      >
        Logout
      </button>
    </p>
  );
}

export default LogoutButton;
