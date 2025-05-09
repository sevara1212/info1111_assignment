"use client";

import { useRouter } from 'next/navigation';
import { FaUser, FaBuilding } from 'react-icons/fa';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl mb-8">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <Image
              src="/images/sevara_apartments.png"
              alt="Building"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 128px) 100vw, 128px"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Sevara Apartments
          </h2>
          <p className="text-gray-600 mb-8">
            Please select your role to continue
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/auth/resident')}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <FaUser className="mr-2" />
            Login as Resident
          </button>

          <button
            onClick={() => router.push('/auth/admin')}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <FaBuilding className="mr-2" />
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  );
}
