"use client";

import Link from "next/link";
import { FaUser, FaShieldAlt } from "react-icons/fa";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to Strata Management</h1>
      
      <div className="flex gap-6">
        <Link
          href="/auth/resident"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-2 text-lg transition-all"
        >
          <FaUser />
          Login as Resident
        </Link>

        <Link
          href="/auth/admin"
          className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-2 text-lg transition-all"
        >
          <FaShieldAlt />
          Login as Admin
        </Link>
      </div>
    </div>
  );
}
