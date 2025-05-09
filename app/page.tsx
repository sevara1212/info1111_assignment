"use client";

import { useRouter } from 'next/navigation';
import { FaUser, FaShieldAlt } from 'react-icons/fa';
import Image from 'next/image';

export default function HomePage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Strata Management
          </h1>
          <p className="text-gray-600 mb-8">
            Please select your role to continue
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/auth/resident')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-3 text-lg transition-colors duration-200"
          >
            <FaUser className="h-5 w-5" />
            Login as Resident
          </button>

          <button
            onClick={() => router.push('/auth/admin')}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-3 text-lg transition-colors duration-200"
          >
            <FaShieldAlt className="h-5 w-5" />
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  );
}
