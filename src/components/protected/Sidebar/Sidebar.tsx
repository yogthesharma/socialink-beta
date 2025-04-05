"use client";

import { getSupabaseBrowser } from "@/lib/supabase/browser";

import React from "react";

const Sidebar = () => {
  const supabase = getSupabaseBrowser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload()
  };

  return (
    <aside className="w-64 bg-gray-100 p-4 h-screen relative">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Dashboard</h2>
      </div>
      <nav>
        <ul className="space-y-2">
          <li>
            <a
              href="/dashboard"
              className="block p-2 hover:bg-gray-200 rounded"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a href="/profile" className="block p-2 hover:bg-gray-200 rounded">
              Profile
            </a>
          </li>
          <li>
            <a href="/settings" className="block p-2 hover:bg-gray-200 rounded">
              Settings
            </a>
          </li>
        </ul>
      </nav>

      <div className="absolute left-0 bottom-8 w-full">
        <div className="p-4  w-full">
          <button
            onClick={handleLogout}
            className="bg-red-200 p-2 px-4 rounded-md text-red-500 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
