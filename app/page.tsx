"use client";

import Link from 'next/link';
import { FaUser, FaUserShield } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Strata Management System</h1>
          <p className="text-lg text-gray-600">Welcome! Please select your role to continue.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Resident Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <FaUser className="text-4xl text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-center mb-6">Resident Portal</h2>
            <div className="space-y-4">
              <Link 
                href="/resident/login"
                className="block w-full text-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login as Resident
              </Link>
              <Link 
                href="/auth/signup/resident"
                className="block w-full text-center bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Create Resident Account
              </Link>
            </div>
          </div>

          {/* Admin Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <FaUserShield className="text-4xl text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-center mb-6">Admin Portal</h2>
            <div className="space-y-4">
              <Link 
                href="/admin/login"
                className="block w-full text-center bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Login as Admin
              </Link>
              <Link 
                href="/admin/login"
                className="block w-full text-center bg-gray-100 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Create Admin Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
