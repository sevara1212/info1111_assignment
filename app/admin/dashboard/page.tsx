'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaSpinner, FaTools, FaClipboardCheck, FaDownload, FaPhone, FaHome, FaCog, FaSignOutAlt, FaUsers, FaChartBar, FaFileAlt, FaDollarSign, FaClock } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, onSnapshot, getCountFromServer, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const { user, userData, loading, signOut } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [dateString, setDateString] = useState('');
  const [timeString, setTimeString] = useState('');
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [unitCount, setUnitCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activity, setActivity] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    console.log('user:', user);
    console.log('userData:', userData);
    if (!user && userData && userData.role === 'admin') {
      window.location.href = '/admin/dashboard';
    }
  }, [user, userData]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDateString(now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      setTimeString(now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'maintenance_requests'), where('status', '!=', 'completed'));
    const unsub = onSnapshot(q, (snap) => setMaintenanceCount(snap.size));
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'lift_bookings'), where('status', '==', 'pending'));
    const unsub = onSnapshot(q, (snap) => setPendingBookings(snap.size));
    return () => unsub();
  }, []);

  useEffect(() => {
    getCountFromServer(collection(db, 'documents')).then(snap => setDocCount(snap.data().count || 0));
  }, []);

  useEffect(() => {
    getCountFromServer(collection(db, 'users')).then(snap => setUnitCount(snap.data().count || 0));
  }, []);

  useEffect(() => {
    if (!userData) return;
    const q = query(collection(db, 'contact_messages'), where('to', '==', userData.email), where('read', '==', false));
    const unsub = onSnapshot(q, (snap) => setUnreadMessages(snap.size));
    return () => unsub();
  }, [userData]);

  useEffect(() => {
    getCountFromServer(collection(db, 'logs')).then(snap => setActivity(snap.data().count || 0));
  }, []);

  useEffect(() => {
    // Fetch amenity payments revenue
    const fetchRevenue = async () => {
      try {
        const q = query(collection(db, 'amenity_payments'));
        const querySnapshot = await getDocs(q);
        const total = querySnapshot.docs.reduce((sum, doc) => {
          const data = doc.data();
          return sum + (data.amount || 0);
        }, 0);
        setTotalRevenue(total);
      } catch (error) {
        console.error('Error fetching revenue:', error);
      }
    };
    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50 to-emerald-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto mb-4" />
          <span className="text-lg text-stone-700">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-emerald-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-80 bg-white/30 backdrop-blur-xl border-r border-stone-200/50 shadow-xl flex flex-col py-8 min-h-screen">
          <div className="mb-8 flex flex-col items-center px-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-4xl text-white mb-4 shadow-lg">
              {userData.name?.charAt(0) || 'A'}
            </div>
            <div className="font-bold text-xl text-stone-800">{userData.name}</div>
            <div className="text-sm text-stone-600 mb-2">{userData.email}</div>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              Administrator
            </div>
          </div>
          
          <nav className="flex flex-col gap-2 px-4 flex-1">
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-medium text-base border border-emerald-200 shadow-sm">
              <FaHome className="text-emerald-600" /> Dashboard
            </Link>
            <Link href="/admin/maintenance" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaTools className="text-stone-600" /> Maintenance
            </Link>
            <Link href="/admin/lift-bookings" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaClipboardCheck className="text-stone-600" /> Lift Bookings
            </Link>
            <Link href="/admin/documents" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaFileAlt className="text-stone-600" /> Documents
            </Link>
            <Link href="/admin/amenity-payments" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaDollarSign className="text-stone-600" /> Amenity Payments
            </Link>
            <Link href="/strata-roll" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaUsers className="text-stone-600" /> Resident Directory
            </Link>
            <Link href="/downloads" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaDownload className="text-stone-600" /> Downloads
            </Link>
            <Link href="/contact" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaPhone className="text-stone-600" /> Contact
            </Link>
            <Link href="/admin/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaChartBar className="text-stone-600" /> Analytics
            </Link>
          </nav>

          <div className="mt-auto px-4 space-y-2">
            <button onClick={() => setShowSettings(true)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-base w-full border border-stone-200 transition-all duration-200">
              <FaCog className="text-stone-600" /> Settings
            </button>
            <button onClick={async () => { await signOut(); }} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-medium text-base w-full border border-red-200 transition-all duration-200">
              <FaSignOutAlt className="text-red-600" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-8 mb-8 border border-stone-200/50">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-stone-800 mb-3">
                    Welcome back, {userData.name}
                  </h1>
                  <div className="flex items-center gap-4 text-stone-600 mb-2">
                    <FaClock className="text-emerald-600" />
                    <span className="text-lg">{dateString}</span>
                  </div>
                  <div className="text-3xl font-bold text-emerald-600 mb-3">{timeString}</div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      Admin Dashboard
                    </span>
                    <span className="text-stone-600">•</span>
                    <span className="text-stone-600">Building Management System</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Image 
                    src="/images/sevara_apartments.jpg" 
                    alt="Building" 
                    width={320} 
                    height={180} 
                    className="rounded-2xl object-cover shadow-lg border border-stone-200/50" 
                  />
                </div>
              </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/admin/maintenance" className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-stone-200/50 hover:bg-white/80 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaTools className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Maintenance Requests</h3>
                  <div className="text-3xl font-bold text-amber-600 mb-1">{maintenanceCount}</div>
                  <p className="text-stone-600">Open requests</p>
                </div>
              </Link>

              <Link href="/admin/lift-bookings" className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-stone-200/50 hover:bg-white/80 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaClipboardCheck className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Lift Bookings</h3>
                  <div className="text-3xl font-bold text-emerald-600 mb-1">{pendingBookings}</div>
                  <p className="text-stone-600">Pending approval</p>
                </div>
              </Link>

              <Link href="/admin/documents" className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-stone-200/50 hover:bg-white/80 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaFileAlt className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Documents</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{docCount}</div>
                  <p className="text-stone-600">Total files</p>
                </div>
              </Link>

              <Link href="/admin/amenity-payments" className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-stone-200/50 hover:bg-white/80 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaDollarSign className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Revenue</h3>
                  <div className="text-3xl font-bold text-green-600 mb-1">${totalRevenue}</div>
                  <p className="text-stone-600">Amenity payments</p>
                </div>
              </Link>

              <Link href="/strata-roll" className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-stone-200/50 hover:bg-white/80 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaUsers className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Residents</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{unitCount}</div>
                  <p className="text-stone-600">Total units</p>
                </div>
              </Link>

              <Link href="/admin/analytics" className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-stone-200/50 hover:bg-white/80 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaChartBar className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Analytics</h3>
                  <div className="text-3xl font-bold text-teal-600 mb-1">{activity}</div>
                  <p className="text-stone-600">System events</p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-stone-200">
            <button 
              onClick={() => setShowSettings(false)} 
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 text-2xl transition-colors"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-6 text-stone-800">Admin Settings</h3>
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <h4 className="font-semibold text-stone-800 mb-2">Account Information</h4>
                <p className="text-stone-600 text-sm">Manage your admin account settings and preferences.</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-2">System Status</h4>
                <p className="text-emerald-600 text-sm">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 