'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, query, where, onSnapshot } from 'firebase/firestore';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMaintenanceRequests: 0,
    pendingMaintenance: 0,
    completedMaintenance: 0,
    totalLiftBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    totalDocuments: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total counts
        const [users, maintenance, bookings, documents, messages] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'maintenance_requests')),
          getCountFromServer(collection(db, 'lift_bookings')),
          getCountFromServer(collection(db, 'documents')),
          getCountFromServer(collection(db, 'contact_messages')),
        ]);

        // Get specific status counts
        const [pendingMaintenance, completedMaintenance, pendingBookings, approvedBookings] = await Promise.all([
          getCountFromServer(query(collection(db, 'maintenance_requests'), where('status', '==', 'pending'))),
          getCountFromServer(query(collection(db, 'maintenance_requests'), where('status', '==', 'completed'))),
          getCountFromServer(query(collection(db, 'lift_bookings'), where('status', '==', 'pending'))),
          getCountFromServer(query(collection(db, 'lift_bookings'), where('status', '==', 'approved'))),
        ]);

        setStats({
          totalUsers: users.data().count,
          totalMaintenanceRequests: maintenance.data().count,
          pendingMaintenance: pendingMaintenance.data().count,
          completedMaintenance: completedMaintenance.data().count,
          totalLiftBookings: bookings.data().count,
          pendingBookings: pendingBookings.data().count,
          approvedBookings: approvedBookings.data().count,
          totalDocuments: documents.data().count,
          totalMessages: messages.data().count,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, subtitle, color }: { title: string; value: number; subtitle?: string; color: string }) => (
    <div className="bg-[#23272f] rounded-xl shadow-lg p-6 border border-green-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-full ${color.includes('green') ? 'bg-green-600' : color.includes('blue') ? 'bg-blue-600' : color.includes('yellow') ? 'bg-yellow-600' : 'bg-purple-600'} bg-opacity-20 flex items-center justify-center`}>
          <div className={`w-6 h-6 rounded-full ${color.includes('green') ? 'bg-green-600' : color.includes('blue') ? 'bg-blue-600' : color.includes('yellow') ? 'bg-yellow-600' : 'bg-purple-600'}`}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-8 bg-[#18181b] min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-green-400">Analytics Dashboard</h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-green-300 text-lg">Loading analytics...</div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={stats.totalUsers} color="text-green-400" />
            <StatCard title="Total Messages" value={stats.totalMessages} color="text-blue-400" />
            <StatCard title="Documents" value={stats.totalDocuments} color="text-purple-400" />
            <StatCard title="Lift Bookings" value={stats.totalLiftBookings} color="text-yellow-400" />
          </div>

          {/* Maintenance Stats */}
          <div className="bg-[#23272f] rounded-xl shadow-lg p-6 border border-green-700">
            <h2 className="text-xl font-bold mb-6 text-green-300">Maintenance Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{stats.totalMaintenanceRequests}</div>
                <div className="text-gray-400">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{stats.pendingMaintenance}</div>
                <div className="text-gray-400">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{stats.completedMaintenance}</div>
                <div className="text-gray-400">Completed</div>
              </div>
            </div>
            <div className="mt-6">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.totalMaintenanceRequests > 0 ? (stats.completedMaintenance / stats.totalMaintenanceRequests) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-400 mt-2">
                Completion Rate: {stats.totalMaintenanceRequests > 0 ? Math.round((stats.completedMaintenance / stats.totalMaintenanceRequests) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Lift Booking Stats */}
          <div className="bg-[#23272f] rounded-xl shadow-lg p-6 border border-green-700">
            <h2 className="text-xl font-bold mb-6 text-green-300">Lift Bookings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{stats.totalLiftBookings}</div>
                <div className="text-gray-400">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{stats.pendingBookings}</div>
                <div className="text-gray-400">Pending Approval</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{stats.approvedBookings}</div>
                <div className="text-gray-400">Approved</div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-[#23272f] rounded-xl shadow-lg p-6 border border-green-700">
            <h2 className="text-xl font-bold mb-6 text-green-300">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-[#1a1d23] rounded-lg">
                <span className="text-gray-300">Database Status</span>
                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">Online</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#1a1d23] rounded-lg">
                <span className="text-gray-300">Last Updated</span>
                <span className="text-gray-400">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 