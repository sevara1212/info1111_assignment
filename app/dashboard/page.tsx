'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaSpinner } from 'react-icons/fa';

export default function Dashboard() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user || !userData) {
        router.push('/login');
      } else if (userData.role !== 'resident') {
        router.push('/login');
      }
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
        <span className="ml-4 text-lg text-gray-700">Loading...</span>
      </div>
    );
  }

  if (!user || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {userData.name}</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-medium">{userData.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Apartment:</p>
              <p className="font-medium">{userData.apartment}</p>
            </div>
            <div>
              <p className="text-gray-600">Floor:</p>
              <p className="font-medium">{userData.floor}</p>
            </div>
          </div>
        </div>

        {/* Add more dashboard content here */}
      </div>
    </div>
  );
} 