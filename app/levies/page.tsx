'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FaMoneyBillWave, FaFilter, FaSpinner } from 'react-icons/fa';

interface Levy {
  id: string;
  amount: number;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

export default function LeviesPage() {
  const { userData } = useAuth();
  const [levies, setLevies] = useState<Levy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  useEffect(() => {
    if (userData) {
      fetchLevies();
    }
  }, [userData]);

  const fetchLevies = async () => {
    if (!userData) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'levies'),
        where('apartment', '==', userData.apartment),
        orderBy('dueDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const leviesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate.toDate()
      })) as Levy[];
      
      setLevies(leviesData);
    } catch (error) {
      console.error('Error fetching levies:', error);
      setError('Failed to load levy information');
    } finally {
      setLoading(false);
    }
  };

  const filteredLevies = levies.filter(levy => 
    filter === 'all' ? true : levy.status === filter
  );

  const totalAmount = filteredLevies.reduce((sum, levy) => sum + levy.amount, 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FaMoneyBillWave className="text-blue-600" />
        Strata Levies
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Levy History</h2>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levies</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : filteredLevies.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No levies found</p>
        ) : (
          <>
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                ${totalAmount.toFixed(2)}
              </p>
            </div>

            <div className="space-y-4">
              {filteredLevies.map((levy) => (
                <div
                  key={levy.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{levy.description}</h3>
                      <p className="text-sm text-gray-500">
                        Due: {levy.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">${levy.amount.toFixed(2)}</p>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        levy.status === 'paid' ? 'bg-green-100 text-green-800' :
                        levy.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {levy.status.charAt(0).toUpperCase() + levy.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 