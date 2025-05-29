'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaSpinner } from 'react-icons/fa';

const ADMIN_ROLES = [
  'Security',
  'Strata Management',
  'Building Management',
  'Chairperson',
  'Treasurer',
  'Secretary'
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    console.log('user:', user);
    console.log('userData:', userData);
    if (!user && userData && userData.role === 'admin') {
      window.location.href = '/admin/dashboard';
    }
  }, [user, userData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-green-600" />
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
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {userData.name}</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-medium">{userData.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Role:</p>
              <p className="font-medium">{userData.adminRole || 'Admin'}</p>
            </div>
          </div>
        </div>
        {/* Example admin dashboard boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-100 rounded-lg p-6 text-center shadow">
            <h3 className="text-lg font-semibold mb-2">Maintenance Panel</h3>
            <p className="text-red-700">View and manage all maintenance requests.</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-6 text-center shadow">
            <h3 className="text-lg font-semibold mb-2">Lift Bookings</h3>
            <p className="text-blue-700">Approve or deny lift bookings.</p>
          </div>
          <div className="bg-green-100 rounded-lg p-6 text-center shadow">
            <h3 className="text-lg font-semibold mb-2">Resident Messages</h3>
            <p className="text-green-700">Send messages to all residents.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 