'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { FaUsers, FaTools, FaClipboardCheck, FaFileAlt, FaEnvelope, FaDollarSign, FaChartLine, FaExclamationTriangle, FaCheckCircle, FaClock, FaSpinner } from 'react-icons/fa';

interface AnalyticsData {
  users: {
    total: number;
    admins: number;
    residents: number;
  };
  maintenance: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    thisMonth: number;
  };
  liftBookings: {
    total: number;
    pending: number;
    approved: number;
    thisMonth: number;
  };
  documents: {
    total: number;
    public: number;
    resident: number;
    admin: number;
  };
  messages: {
    total: number;
    unread: number;
    thisWeek: number;
  };
  amenityPayments: {
    total: number;
    totalRevenue: number;
    thisMonth: number;
    thisMonthRevenue: number;
  };
  recentActivity: any[];
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({ icon, title, value, subtitle, color, trend }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <span>{trend.isPositive ? '↗' : '↘'}</span>
            <span>{Math.abs(trend.value)}% vs last month</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function AdminAnalyticsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Show loading while auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user && userData && (
    userData.role === 'admin' || 
    user.email?.includes('admin') || 
    user.email?.endsWith('@sevara.apartments')
  );

  if (!user || !userData || !isAdmin) {
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
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      // Helper function to safely get count
      const getCount = async (query: any) => {
        try {
          const snapshot = await getCountFromServer(query);
          return snapshot.data().count || 0;
        } catch (error) {
          console.warn('Count query failed, falling back to getDocs:', error);
          const snapshot = await getDocs(query);
          return snapshot.size;
        }
      };

      // Date helpers
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      // Fetch all analytics data
      const [
        totalUsers,
        adminUsers,
        residentUsers,
        totalMaintenance,
        pendingMaintenance,
        inProgressMaintenance,
        completedMaintenance,
        totalLiftBookings,
        pendingBookings,
        approvedBookings,
        totalDocuments,
        publicDocs,
        residentDocs,
        adminDocs,
        totalMessages,
        unreadMessages,
        totalPayments,
        recentActivitySnapshot
      ] = await Promise.all([
        // Users
        getCount(collection(db, 'users')),
        getCount(query(collection(db, 'users'), where('role', '==', 'admin'))),
        getCount(query(collection(db, 'users'), where('role', '==', 'resident'))),
        
        // Maintenance
        getCount(collection(db, 'maintenance_requests')),
        getCount(query(collection(db, 'maintenance_requests'), where('status', '==', 'pending'))),
        getCount(query(collection(db, 'maintenance_requests'), where('status', '==', 'in-progress'))),
        getCount(query(collection(db, 'maintenance_requests'), where('status', '==', 'completed'))),
        
        // Lift Bookings
        getCount(collection(db, 'lift_bookings')),
        getCount(query(collection(db, 'lift_bookings'), where('status', '==', 'pending'))),
        getCount(query(collection(db, 'lift_bookings'), where('status', '==', 'approved'))),
        
        // Documents
        getCount(collection(db, 'documents')),
        getCount(query(collection(db, 'documents'), where('visibility', '==', 'public'))),
        getCount(query(collection(db, 'documents'), where('visibility', '==', 'resident'))),
        getCount(query(collection(db, 'documents'), where('visibility', '==', 'admin'))),
        
        // Messages
        getCount(collection(db, 'contact_messages')),
        getCount(query(collection(db, 'contact_messages'), where('read', '==', false))),
        
        // Amenity Payments
        getCount(collection(db, 'amenity_payments')),
        
        // Recent Activity
        getDocs(query(collection(db, 'maintenance_requests'), orderBy('createdAt', 'desc'), limit(5)))
      ]);

      // Calculate revenue
      const paymentsSnapshot = await getDocs(collection(db, 'amenity_payments'));
      let totalRevenue = 0;
      let thisMonthRevenue = 0;
      let thisMonthPayments = 0;

      paymentsSnapshot.forEach(doc => {
        const data = doc.data();
        const amount = data.amount || 0;
        totalRevenue += amount;
        
        if (data.paidAt?.toDate() >= startOfMonth) {
          thisMonthRevenue += amount;
          thisMonthPayments++;
        }
      });

      // This month maintenance requests
      const thisMonthMaintenanceSnapshot = await getDocs(
        query(collection(db, 'maintenance_requests'), where('createdAt', '>=', startOfMonth))
      );

      // This month lift bookings
      const thisMonthBookingsSnapshot = await getDocs(
        query(collection(db, 'lift_bookings'), where('createdAt', '>=', startOfMonth))
      );

      // This week messages
      const thisWeekMessagesSnapshot = await getDocs(
        query(collection(db, 'contact_messages'), where('createdAt', '>=', startOfWeek))
      );

      // Format recent activity
      const recentActivity = recentActivitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'maintenance'
      }));

      setAnalytics({
        users: {
          total: totalUsers,
          admins: adminUsers,
          residents: residentUsers
        },
        maintenance: {
          total: totalMaintenance,
          pending: pendingMaintenance,
          inProgress: inProgressMaintenance,
          completed: completedMaintenance,
          thisMonth: thisMonthMaintenanceSnapshot.size
        },
        liftBookings: {
          total: totalLiftBookings,
          pending: pendingBookings,
          approved: approvedBookings,
          thisMonth: thisMonthBookingsSnapshot.size
        },
        documents: {
          total: totalDocuments,
          public: publicDocs,
          resident: residentDocs,
          admin: adminDocs
        },
        messages: {
          total: totalMessages,
          unread: unreadMessages,
          thisWeek: thisWeekMessagesSnapshot.size
        },
        amenityPayments: {
          total: totalPayments,
          totalRevenue,
          thisMonth: thisMonthPayments,
          thisMonthRevenue
        },
        recentActivity
      });

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your strata management system</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FaUsers className="text-white" />}
            title="Total Users"
            value={analytics.users.total}
            subtitle={`${analytics.users.admins} admins, ${analytics.users.residents} residents`}
            color="bg-blue-500"
          />
          <StatCard
            icon={<FaTools className="text-white" />}
            title="Maintenance Requests"
            value={analytics.maintenance.total}
            subtitle={`${analytics.maintenance.pending} pending`}
            color="bg-yellow-500"
          />
          <StatCard
            icon={<FaClipboardCheck className="text-white" />}
            title="Lift Bookings"
            value={analytics.liftBookings.total}
            subtitle={`${analytics.liftBookings.pending} pending approval`}
            color="bg-green-500"
          />
          <StatCard
            icon={<FaDollarSign className="text-white" />}
            title="Total Revenue"
            value={`$${analytics.amenityPayments.totalRevenue}`}
            subtitle={`${analytics.amenityPayments.total} payments`}
            color="bg-purple-500"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<FaFileAlt className="text-white" />}
            title="Documents"
            value={analytics.documents.total}
            subtitle={`${analytics.documents.public} public, ${analytics.documents.resident} resident, ${analytics.documents.admin} admin`}
            color="bg-indigo-500"
          />
          <StatCard
            icon={<FaEnvelope className="text-white" />}
            title="Messages"
            value={analytics.messages.total}
            subtitle={`${analytics.messages.unread} unread`}
            color="bg-red-500"
          />
          <StatCard
            icon={<FaChartLine className="text-white" />}
            title="This Month"
            value={analytics.maintenance.thisMonth + analytics.liftBookings.thisMonth}
            subtitle="New requests & bookings"
            color="bg-teal-500"
          />
        </div>

        {/* Data Export Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Feedback Export */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <FaEnvelope className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Feedback Export</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Download all contact form submissions and feedback from Firestore as a CSV file for analysis and reporting.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Messages:</span>
                <span className="font-medium">{analytics.messages.total}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Unread Messages:</span>
                <span className="font-medium text-red-600">{analytics.messages.unread}</span>
              </div>
            </div>
            <div className="mt-6">
              <a
                href="http://export-feedback.ibragimovasevar.replit.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full justify-center font-medium"
              >
                <FaFileAlt className="text-sm" />
                Download CSV Export
              </a>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-100">
                <FaCheckCircle className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Current status of all building management systems and services.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <span className="flex items-center gap-2 text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">User Portal</span>
                <span className="flex items-center gap-2 text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Notifications</span>
                <span className="flex items-center gap-2 text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Maintenance Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Pending</span>
                </div>
                <span className="font-semibold">{analytics.maintenance.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">In Progress</span>
                </div>
                <span className="font-semibold">{analytics.maintenance.inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Completed</span>
                </div>
                <span className="font-semibold">{analytics.maintenance.completed}</span>
              </div>
            </div>
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${analytics.maintenance.total > 0 ? (analytics.maintenance.completed / analytics.maintenance.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Completion Rate: {analytics.maintenance.total > 0 ? Math.round((analytics.maintenance.completed / analytics.maintenance.total) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Total Revenue</span>
                <span className="font-semibold text-green-600">${analytics.amenityPayments.totalRevenue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">This Month</span>
                <span className="font-semibold">${analytics.amenityPayments.thisMonthRevenue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Avg per Payment</span>
                <span className="font-semibold">
                  ${analytics.amenityPayments.total > 0 ? Math.round(analytics.amenityPayments.totalRevenue / analytics.amenityPayments.total) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {analytics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaTools className="text-yellow-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title || 'Maintenance Request'}</p>
                    <p className="text-sm text-gray-600">
                      {activity.description || 'No description provided'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
} 