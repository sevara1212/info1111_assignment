'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaSpinner } from 'react-icons/fa';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, checkAuth } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!loading) {
        if (!user) {
          router.push('/resident/login');
          return;
        }

        const authorized = await checkAuth(requiredRole);
        if (!authorized) {
          if (requiredRole === 'admin') {
            router.push('/admin/login');
          } else {
            router.push('/resident/login');
          }
          return;
        }

        setIsAuthorized(true);
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [user, loading, requiredRole, router, checkAuth]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
        <span className="ml-4 text-lg text-gray-700">Loading...</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
} 