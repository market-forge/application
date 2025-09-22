import React from "react";
import { VscAccount } from "react-icons/vsc";

function AccountButton() {
  const accountAuth = () => {
    window.open("http://localhost:3000/account/login", "_self");
  };

  return (
    <button
      onClick={accountAuth}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 
                 bg-gray-600 hover:bg-gray-900 text-white font-medium rounded-lg shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-gray-600 transition"
      aria-label="Login with GitHub"
    >
      < VscAccount className="text-xl" />
      ACCOUNT
    </button>
  );
}

export default AccountButton;
