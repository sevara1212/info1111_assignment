"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FaFileInvoiceDollar, FaCalendarAlt, FaMoneyBillWave, FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface LevyInfo {
  unit: string;
  quarter: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export default function LevyCheckPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [levyInfo, setLevyInfo] = useState<LevyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/resident');
      return;
    }

    const fetchLevyInfo = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const unit = userData.apartment || 'unknown';
          
          // Calculate levy amount based on unit number
          let amount = 300; // Base amount
          if (unit >= 401 && unit <= 450) {
            amount = 350; // Penthouse surcharge
          }

          // Get current quarter
          const now = new Date();
          const quarter = `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
          
          // Calculate due date (15th of next month)
          const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);
          
          setLevyInfo({
            unit: unit.toString(),
            quarter,
            amount,
            dueDate: dueDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            status: 'pending'
          });
        }
      } catch (error) {
        console.error('Error fetching levy info:', error);
        setError('Failed to load levy information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLevyInfo();
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FaFileInvoiceDollar className="text-blue-600" />
        Levy Notice
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {levyInfo && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaFileInvoiceDollar className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Unit Number</h3>
                  <p className="text-gray-600">{levyInfo.unit}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaCalendarAlt className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Period</h3>
                  <p className="text-gray-600">{levyInfo.quarter}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FaMoneyBillWave className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Amount Due</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    ${levyInfo.amount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-3">
                <p className="text-gray-600">
                  <span className="font-medium">Due Date:</span> {levyInfo.dueDate}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    levyInfo.status === 'paid' ? 'bg-green-100 text-green-700' :
                    levyInfo.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {levyInfo.status.charAt(0).toUpperCase() + levyInfo.status.slice(1)}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Please make your payment through the strata portal before the due date to avoid late fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 