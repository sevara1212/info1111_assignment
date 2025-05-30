'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaSpinner, FaTools, FaClipboardCheck, FaDownload, FaPhone, FaHome, FaCog, FaSignOutAlt, FaUsers, FaChartBar, FaFileAlt, FaDollarSign } from 'react-icons/fa';
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
    <div className="min-h-screen flex bg-black">
      {/* Sidebar */}
      <aside className="w-72 bg-[#111827] text-white flex flex-col items-center py-8 min-h-screen shadow-xl border-r-2 border-green-500">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-3xl mb-2 shadow-lg border-4 border-green-300">
            {userData.name?.charAt(0) || 'A'}
          </div>
          <div className="font-semibold text-lg text-green-300">{userData.name}</div>
          <div className="text-sm text-gray-400">{userData.email}</div>
        </div>
        <nav className="flex flex-col gap-3 w-full px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-900 hover:bg-green-700 transition font-medium text-base mb-1 text-white border border-green-500"><FaHome style={{ color: '#22d3ee' }} /> Dashboard</Link>
          <Link href="/admin/maintenance" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-900 hover:bg-green-700 transition font-medium text-base mb-1 text-white border border-green-500"><FaTools style={{ color: '#22d3ee' }} /> Maintenance</Link>
          <Link href="/admin/lift-bookings" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-900 hover:bg-green-700 transition font-medium text-base mb-1 text-white border border-green-500"><FaClipboardCheck style={{ color: '#22d3ee' }} /> Lift Bookings</Link>
          <Link href="/admin/documents" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-900 hover:bg-green-700 transition font-medium text-base mb-1 text-white border border-green-500"><FaFileAlt style={{ color: '#22d3ee' }} /> Documents</Link>
          <Link href="/admin/amenity-payments" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-900 hover:bg-green-700 transition font-medium text-base mb-1 text-white border border-green-500"><FaDollarSign style={{ color: '#22d3ee' }} /> Amenity Payments</Link>
          <Link href="/strata-roll" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-900 hover:bg-green-700 transition font-medium text-base mb-1 text-white border border-green-500"><FaUsers style={{ color: '#22d3ee' }} /> Strata Roll</Link>
          <Link href="/downloads" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-900 hover:bg-green-700 transition font-medium text-base mb-1 text-white border border-green-500"><FaDownload style={{ color: '#22d3ee' }} /> Downloads</Link>
          <Link href="/contact" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-900 hover:bg-green-700 transition font-medium text-base text-white border border-green-500"><FaPhone style={{ color: '#22d3ee' }} /> Contact</Link>
          <button onClick={() => setShowSettings(true)} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-900 hover:bg-green-700 transition font-medium text-base text-white border border-green-500"><FaCog style={{ color: '#22d3ee' }} /> Settings</button>
          <button onClick={async () => { await signOut(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-900 hover:bg-green-700 transition font-medium text-base text-white border border-green-500"><FaSignOutAlt style={{ color: '#22d3ee' }} /> Sign Out</button>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10 bg-[#18181b]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#23272f] rounded-2xl shadow-lg p-8 mb-8 border border-green-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold mb-2 leading-tight text-green-400">Welcome, {userData.name} (Admin)</h2>
                {dateString && <div className="text-green-200 mb-1 text-lg">{dateString}</div>}
                {timeString && <div className="text-3xl font-bold text-green-500">{timeString}</div>}
                <div className="mt-2 text-base text-green-300">Role: {userData.role || '-'}</div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-8 flex-shrink-0">
                <Image src="/images/sevara_apartments.jpg" alt="Building" width={340} height={200} className="rounded-lg object-cover shadow-lg border-4 border-green-700" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-8">
            <Link href="/admin/maintenance" className="bg-[#23272f] rounded-2xl shadow-lg p-12 flex flex-col items-center hover:bg-green-900 transition cursor-pointer min-h-[180px] border border-green-700">
              <FaTools className="text-5xl mb-3" style={{ color: '#22d3ee' }} />
              <div className="font-semibold text-xl text-green-200">Maintenance Requests</div>
              <div className="text-green-400 mt-2 text-lg font-bold">{maintenanceCount} open</div>
            </Link>
            <Link href="/admin/lift-bookings" className="bg-[#23272f] rounded-2xl shadow-lg p-12 flex flex-col items-center hover:bg-green-900 transition cursor-pointer min-h-[180px] border border-green-700">
              <FaClipboardCheck className="text-5xl mb-3" style={{ color: '#22d3ee' }} />
              <div className="font-semibold text-xl text-green-200">Lift Bookings</div>
              <div className="text-green-400 mt-2 text-lg font-bold">{pendingBookings} pending</div>
            </Link>
            <Link href="/admin/documents" className="bg-[#23272f] rounded-2xl shadow-lg p-12 flex flex-col items-center hover:bg-green-900 transition cursor-pointer min-h-[180px] border border-green-700">
              <FaDownload className="text-5xl mb-3" style={{ color: '#22d3ee' }} />
              <div className="font-semibold text-xl text-green-200">Document Management</div>
              <div className="text-green-400 mt-2 text-lg font-bold">{docCount} files</div>
            </Link>
            <Link href="/admin/amenity-payments" className="bg-[#23272f] rounded-2xl shadow-lg p-12 flex flex-col items-center hover:bg-green-900 transition cursor-pointer min-h-[180px] border border-green-700">
              <FaDollarSign className="text-5xl mb-3" style={{ color: '#22d3ee' }} />
              <div className="font-semibold text-xl text-green-200">Amenity Payments</div>
              <div className="text-green-400 mt-2 text-lg font-bold">${totalRevenue}</div>
            </Link>
            <Link href="/strata-roll" className="bg-[#23272f] rounded-2xl shadow-lg p-12 flex flex-col items-center hover:bg-green-900 transition cursor-pointer min-h-[180px] border border-green-700">
              <FaUsers className="text-5xl mb-3" style={{ color: '#22d3ee' }} />
              <div className="font-semibold text-xl text-green-200">Resident Directory</div>
              <div className="text-green-400 mt-2 text-lg font-bold">{unitCount} units</div>
            </Link>
            <Link href="/admin/analytics" className="bg-[#23272f] rounded-2xl shadow-lg p-12 flex flex-col items-center hover:bg-green-900 transition cursor-pointer min-h-[180px] border border-green-700">
              <FaChartBar className="text-5xl mb-3" style={{ color: '#22d3ee' }} />
              <div className="font-semibold text-xl text-green-200">Analytics</div>
              <div className="text-green-400 mt-2 text-lg font-bold">{activity} events</div>
            </Link>
            <Link href="/admin/messages" className="bg-[#23272f] rounded-2xl shadow-lg p-12 flex flex-col items-center hover:bg-green-900 transition cursor-pointer min-h-[180px] border border-green-700">
              <FaPhone className="text-5xl mb-3" style={{ color: '#22d3ee' }} />
              <div className="font-semibold text-xl text-green-200">Messages</div>
              <div className="text-green-400 mt-2 text-lg font-bold">{unreadMessages} unread</div>
            </Link>
          </div>
        </div>
        {/* Settings Modal Placeholder */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-[#23272f] rounded-xl shadow-xl p-8 w-full max-w-md relative border border-green-700">
              <button onClick={() => setShowSettings(false)} className="absolute top-2 right-2 text-green-400 hover:text-green-200 text-2xl">&times;</button>
              <h3 className="text-xl font-bold mb-4 text-green-300">Settings</h3>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 