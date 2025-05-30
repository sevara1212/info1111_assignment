'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { FaSpinner, FaDollarSign, FaDownload, FaFilter, FaSwimmingPool, FaDumbbell, FaCalendarAlt } from 'react-icons/fa';

interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  apartment: string;
  amenity: string;
  amount: number;
  paidAt: any;
  status: 'paid' | 'pending';
}

export default function AmenityPaymentsPage() {
  const { user, userData } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterAmenity, setFilterAmenity] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Check if user is admin with treasurer role
  if (!user || !userData || userData.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, filterAmenity, filterDate]);

  const fetchPayments = async () => {
    try {
      const q = query(collection(db, 'amenity_payments'), orderBy('paidAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const allPayments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
      setPayments(allPayments);
      
      // Calculate total revenue
      const total = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
      setTotalRevenue(total);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    // Filter by amenity
    if (filterAmenity !== 'all') {
      filtered = filtered.filter(payment => payment.amenity === filterAmenity);
    }

    // Filter by date
    if (filterDate !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (filterDate) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }

      filtered = filtered.filter(payment => 
        payment.paidAt?.toDate?.() >= startDate
      );
    }

    setFilteredPayments(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Resident', 'Apartment', 'Amenity', 'Amount', 'Status'];
    const csvData = filteredPayments.map(payment => [
      payment.paidAt?.toDate?.()?.toLocaleDateString() || 'Unknown',
      payment.userName,
      payment.apartment,
      payment.amenity,
      `$${payment.amount}`,
      payment.status
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amenity-payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getAmenityIcon = (amenity: string) => {
    if (amenity.toLowerCase().includes('pool')) return <FaSwimmingPool className="text-blue-500" />;
    if (amenity.toLowerCase().includes('gym')) return <FaDumbbell className="text-green-500" />;
    return <FaDollarSign className="text-gray-500" />;
  };

  const getRevenueByAmenity = (amenityName: string) => {
    return filteredPayments
      .filter(p => p.amenity === amenityName)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Amenity Payments</h1>
            <p className="text-gray-600 mt-2">Track and manage amenity access payments</p>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FaDownload />
            Export CSV
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <FaDollarSign className="text-2xl text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <FaSwimmingPool className="text-2xl text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Pool Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${getRevenueByAmenity('Swimming Pool')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <FaDumbbell className="text-2xl text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Gym Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${getRevenueByAmenity('Gymnasium')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-2xl text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <FaFilter className="text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenity
              </label>
              <select
                value={filterAmenity}
                onChange={(e) => setFilterAmenity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Amenities</option>
                <option value="Swimming Pool">Swimming Pool</option>
                <option value="Gymnasium">Gymnasium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last 3 Months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <FaDollarSign className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">No amenity payments match your current filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resident
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Apartment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amenity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.paidAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.userEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.apartment}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getAmenityIcon(payment.amenity)}
                          <span className="text-sm text-gray-900">{payment.amenity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredPayments.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredPayments.length} of {payments.length} payment{payments.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
} 