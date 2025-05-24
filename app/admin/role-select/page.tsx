'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserShield, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

const ADMIN_ROLES = [
  { id: 'Security', icon: '🔒' },
  { id: 'Strata Management', icon: '🏢' },
  { id: 'Building Management', icon: '🏗️' },
  { id: 'Chairperson', icon: '👔' },
  { id: 'Treasurer', icon: '💰' },
  { id: 'Secretary', icon: '📝' }
];

export default function AdminRoleSelect() {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    router.push(`/admin/login?role=${encodeURIComponent(role)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <FaUserShield className="text-5xl text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Admin Role
          </h1>
          <p className="text-gray-600">
            Choose your administrative role to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ADMIN_ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <span className="text-2xl mr-3">{role.icon}</span>
              <span className="text-lg font-medium text-gray-900">{role.id}</span>
            </button>
          ))}
        </div>

        <div className="text-center">
          <Link 
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 