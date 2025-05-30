'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaSpinner, FaTools, FaSwimmingPool, FaClipboardCheck, FaDownload, FaPhone, FaHome, FaCog, FaSignOutAlt, FaBell } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Cookies from 'js-cookie';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  userName?: string;
  apartment?: string;
  unit?: string;
  userEmail?: string;
  userId?: string;
}

interface Notification {
  id: string;
  fromName?: string;
  fromEmail?: string;
  message: string;
  sentAt?: any;
  isAdminReply?: boolean;
}

export default function Dashboard() {
  const router = useRouter(); 
  const { user, userData, loading, signOut } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  // Settings modal state
  const [settingsName, setSettingsName] = useState(userData?.name || '');
  const [settingsEmail, setSettingsEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsApartment, setSettingsApartment] = useState(userData?.apartment || '');
  const [settingsUnit, setSettingsUnit] = useState(userData?.unit || '');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Date and time state
  const [dateString, setDateString] = useState('');
  const [timeString, setTimeString] = useState('');
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before showing date/time
  useEffect(() => {
    setMounted(true);
  }, []);

  // Date and time update effect
  useEffect(() => {
    if (!mounted) return;
    
    const update = () => {
      const now = new Date();
      setDateString(now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      setTimeString(now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  useEffect(() => {
    if (!loading) {
      if (!user || !userData) {
        window.location.href = '/resident/login';
      } else if (userData.role !== 'resident') {
        window.location.href = '/resident/login';
      }
    }
    setSettingsName(userData?.name || '');
    setSettingsEmail(user?.email || '');
    setSettingsApartment(userData?.apartment || '');
    setSettingsUnit(userData?.unit || '');
  }, [user, userData, loading, showSettings]);

  // Listen for new messages/notifications
  useEffect(() => {
    if (!userData?.email) return;
    const q = query(
      collection(db, 'contact_messages'), 
      where('to', '==', userData.email),
      where('read', '==', false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
    });
    return () => unsub();
  }, [userData]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'contact_messages', messageId), {
        read: true
      });
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
        <span className="ml-4 text-lg text-gray-700">Loading...</span>
      </div>
    );
  }

  if (!user || !userData) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#f7f8fa]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1a2233] text-white flex flex-col items-center py-8 min-h-screen shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-3xl mb-2 shadow-lg">
            {userData.name?.charAt(0) || 'U'}
          </div>
          <div className="font-semibold text-lg">{userData.name}</div>
          <div className="text-sm text-gray-300">{userData.email}</div>
        </div>
        <nav className="flex flex-col gap-3 w-full px-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-blue-50 transition font-medium text-base mb-1 text-[#16213e]"><FaHome style={{ color: '#16213e' }} /> Dashboard</Link>
          <Link href="/maintenance" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-blue-50 transition font-medium text-base mb-1 text-[#16213e]"><FaTools style={{ color: '#16213e' }} /> Maintenance</Link>
          <Link href="/amenities" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-blue-50 transition font-medium text-base mb-1 text-[#16213e]"><FaSwimmingPool style={{ color: '#16213e' }} /> Amenities</Link>
          <Link href="/book-lift" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-blue-50 transition font-medium text-base mb-1 text-[#16213e]"><FaClipboardCheck style={{ color: '#16213e' }} /> Book Lift</Link>
          <Link href="/downloads" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-blue-50 transition font-medium text-base mb-1 text-[#16213e]"><FaDownload style={{ color: '#16213e' }} /> Downloads</Link>
          <Link href="/contact" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-blue-50 transition font-medium text-base text-[#16213e]"><FaPhone style={{ color: '#16213e' }} /> Contact</Link>
          <button onClick={() => setShowSettings(true)} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-blue-50 transition font-medium text-base text-[#16213e]"><FaCog style={{ color: '#16213e' }} /> Settings</button>
          <button onClick={async () => { await signOut(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white hover:bg-blue-50 transition font-medium text-base text-[#16213e]"><FaSignOutAlt style={{ color: '#16213e' }} /> Sign Out</button>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10 bg-[#f3f4f6]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold mb-2 leading-tight text-gray-900">Good morning {userData.name}, Welcome to Sevara Apartments</h2>
                {mounted && dateString && <div className="text-gray-600 mb-1 text-lg">{dateString}</div>}
                {mounted && timeString && <div className="text-3xl font-bold text-gray-400">{timeString}</div>}
                <div className="mt-2 text-base text-gray-700">Apt: {userData.apartment || userData.unit || '-'} &nbsp; | &nbsp; Unit: {userData.unit || userData.apartment || '-'}</div>
              </div>
              <div className="mt-4 md:mt-0 md:ml-8 flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-3 bg-blue-100 rounded-full hover:bg-blue-200 transition relative"
                  >
                    <FaBell className="text-blue-600 text-xl" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  
                  {/* Notification Popup */}
                  {showNotifications && (
                    <div className="fixed top-4 right-4 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b">
                        <h3 className="font-semibold text-lg">Notifications ({notifications.length})</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-gray-500 text-center">No new notifications</div>
                      ) : (
                        <div className="divide-y">
                          {notifications.map((notif) => (
                            <div key={notif.id} className="p-4 hover:bg-gray-50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">
                                    {notif.isAdminReply ? 'Admin Reply' : `From: ${notif.fromName || notif.fromEmail}`}
                                  </div>
                                  <div className="text-gray-600 text-sm mt-1">{notif.message}</div>
                                  {notif.sentAt && (
                                    <div className="text-xs text-gray-400 mt-2">
                                      {new Date(notif.sentAt.seconds * 1000).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleMarkAsRead(notif.id)}
                                  className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                >
                                  Mark Read
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <Image src="/images/sevara_apartments.jpg" alt="Building" width={340} height={200} className="rounded-lg object-cover shadow-lg" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-8">
            <Link href="/maintenance" className="bg-white rounded-2xl shadow-lg p-16 flex flex-col items-center hover:bg-blue-50 transition cursor-pointer min-h-[260px] border border-blue-100">
              <FaTools className="text-6xl mb-4" style={{ color: '#16213e' }} />
              <div className="font-semibold text-2xl text-[#16213e]">Maintenance</div>
            </Link>
            <Link href="/amenities" className="bg-white rounded-2xl shadow-lg p-16 flex flex-col items-center hover:bg-blue-50 transition cursor-pointer min-h-[260px] border border-blue-100">
              <FaSwimmingPool className="text-6xl mb-4" style={{ color: '#16213e' }} />
              <div className="font-semibold text-2xl text-[#16213e]">Amenities</div>
            </Link>
            <Link href="/book-lift" className="bg-white rounded-2xl shadow-lg p-16 flex flex-col items-center hover:bg-blue-50 transition cursor-pointer min-h-[260px] border border-blue-100">
              <FaClipboardCheck className="text-6xl mb-4" style={{ color: '#16213e' }} />
              <div className="font-semibold text-2xl text-[#16213e]">Book Lift</div>
            </Link>
            <Link href="/downloads" className="bg-white rounded-2xl shadow-lg p-16 flex flex-col items-center hover:bg-blue-50 transition cursor-pointer min-h-[260px] border border-blue-100">
              <FaDownload className="text-6xl mb-4" style={{ color: '#16213e' }} />
              <div className="font-semibold text-2xl text-[#16213e]">Downloads</div>
            </Link>
            <Link href="/contact" className="bg-white rounded-2xl shadow-lg p-16 flex flex-col items-center hover:bg-blue-50 transition cursor-pointer min-h-[260px] border border-blue-100">
              <FaPhone className="text-6xl mb-4" style={{ color: '#16213e' }} />
              <div className="font-semibold text-2xl text-[#16213e]">Contact</div>
            </Link>
          </div>
        </div>
        {/* Settings Modal Placeholder */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
              <button onClick={() => setShowSettings(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
              <h3 className="text-xl font-bold mb-4">Settings</h3>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
