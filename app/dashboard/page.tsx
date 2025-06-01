'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaSpinner, FaTools, FaSwimmingPool, FaClipboardCheck, FaDownload, FaPhone, FaHome, FaCog, FaSignOutAlt, FaBell, FaFileAlt, FaClock } from 'react-icons/fa';
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
  type?: 'message' | 'lift_booking' | 'maintenance_request';
  status?: string;
  title?: string;
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
    
    const allNotifications: Notification[] = [];
    
    // Listen for admin messages
    const messagesQuery = query(
      collection(db, 'contact_messages'), 
      where('to', '==', userData.email),
      where('read', '==', false)
    );
    const unsubMessages = onSnapshot(messagesQuery, (snap) => {
      const messageNotifications = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        type: 'message' as const
      } as Notification));
      
      // Update notifications array
      setNotifications(prev => {
        const filtered = prev.filter(n => n.type !== 'message');
        return [...filtered, ...messageNotifications];
      });
    });

    // Listen for lift booking confirmations
    const liftBookingsQuery = query(
      collection(db, 'lift_bookings'),
      where('userEmail', '==', userData.email),
      where('status', 'in', ['approved', 'denied'])
    );
    const unsubLiftBookings = onSnapshot(liftBookingsQuery, (snap) => {
      const liftNotifications = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: `lift_${doc.id}`,
          message: `Your lift booking for ${data.date} at ${data.time} has been ${data.status}`,
          type: 'lift_booking' as const,
          status: data.status,
          sentAt: data.updatedAt || data.createdAt,
          title: 'Lift Booking Update'
        } as Notification;
      });
      
      setNotifications(prev => {
        const filtered = prev.filter(n => n.type !== 'lift_booking');
        return [...filtered, ...liftNotifications];
      });
    });

    // Listen for maintenance request confirmations
    const maintenanceQuery = query(
      collection(db, 'maintenance_requests'),
      where('userEmail', '==', userData.email),
      where('status', 'in', ['in-progress', 'completed'])
    );
    const unsubMaintenance = onSnapshot(maintenanceQuery, (snap) => {
      const maintenanceNotifications = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: `maintenance_${doc.id}`,
          message: `Your maintenance request "${data.title}" status has been updated to ${data.status}`,
          type: 'maintenance_request' as const,
          status: data.status,
          sentAt: data.updatedAt || data.createdAt,
          title: 'Maintenance Request Update'
        } as Notification;
      });
      
      setNotifications(prev => {
        const filtered = prev.filter(n => n.type !== 'maintenance_request');
        return [...filtered, ...maintenanceNotifications];
      });
    });

    return () => {
      unsubMessages();
      unsubLiftBookings();
      unsubMaintenance();
    };
  }, [userData]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      if (messageId.startsWith('lift_') || messageId.startsWith('maintenance_')) {
        // For lift and maintenance notifications, just remove from local state
        setNotifications(prev => prev.filter(n => n.id !== messageId));
      } else {
        // For admin messages, mark as read in database
        await updateDoc(doc(db, 'contact_messages', messageId), {
          read: true
        });
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

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

      {/* Notifications Button - Fixed Position in Top Right Corner */}
      <div className="fixed top-6 right-6 z-50">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full hover:from-emerald-600 hover:to-teal-600 transition shadow-xl relative backdrop-blur-xl"
          >
            <FaBell className="text-xl" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {notifications.length}
              </span>
            )}
          </button>
          
          {/* Notification Popup */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-4 w-96 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200 z-50 max-h-96 overflow-y-auto">
              <div className="p-6 border-b border-stone-200">
                <h3 className="font-bold text-xl text-stone-800">Notifications ({notifications.length})</h3>
              </div>
              {notifications.length === 0 ? (
                <div className="p-6 text-stone-500 text-center">No new notifications</div>
              ) : (
                <div className="divide-y divide-stone-200">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 hover:bg-stone-50/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-stone-800">
                            {notif.type === 'message' 
                              ? (notif.isAdminReply ? 'Admin Reply' : `From: ${notif.fromName || notif.fromEmail}`)
                              : notif.title
                            }
                          </div>
                          <div className="text-stone-600 text-sm mt-1">{notif.message}</div>
                          {notif.sentAt && (
                            <div className="text-xs text-stone-400 mt-2">
                              {new Date(notif.sentAt.seconds * 1000).toLocaleString()}
                            </div>
                          )}
                          {notif.type && notif.type !== 'message' && (
                            <div className="text-xs mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                notif.type === 'lift_booking' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {notif.type === 'lift_booking' ? 'Lift Booking' : 'Maintenance'}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="ml-3 px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-80 bg-white/30 backdrop-blur-xl border-r border-stone-200/50 shadow-xl flex flex-col py-8 min-h-screen">
          <div className="mb-8 flex flex-col items-center px-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-4xl text-white mb-4 shadow-lg">
              {userData?.name?.charAt(0) || 'R'}
            </div>
            <div className="font-bold text-xl text-stone-800">{userData?.name}</div>
            <div className="text-sm text-stone-600 mb-2">{userData?.email}</div>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              Resident
            </div>
          </div>
          
          <nav className="flex flex-col gap-2 px-4 flex-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-medium text-base border border-emerald-200 shadow-sm">
              <FaHome className="text-emerald-600" /> Dashboard
            </Link>
            <Link href="/maintenance" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaTools className="text-stone-600" /> Maintenance
            </Link>
            <Link href="/book-lift" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaClipboardCheck className="text-stone-600" /> Book Lift
            </Link>
            <Link href="/amenities" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaSwimmingPool className="text-stone-600" /> Amenities
            </Link>
            <Link href="/documents" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaFileAlt className="text-stone-600" /> Documents
            </Link>
            <Link href="/downloads" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaDownload className="text-stone-600" /> Downloads
            </Link>
            <Link href="/contact" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white/70 text-stone-700 hover:text-emerald-700 font-medium text-base border border-stone-200/50 hover:border-emerald-200 transition-all duration-200">
              <FaPhone className="text-stone-600" /> Contact
            </Link>
          </nav>

          <div className="mt-auto px-4 space-y-2">
            <button onClick={() => setShowSettings(true)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-base w-full border border-stone-200 transition-all duration-200">
              <FaCog className="text-stone-600" /> Settings
            </button>
            <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-medium text-base w-full border border-red-200 transition-all duration-200">
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
                    Good morning, {userData.name}
                  </h1>
                  <p className="text-xl text-stone-600 mb-4">Welcome back to Sevara Apartments</p>
                  <div className="flex items-center gap-4 text-stone-600 mb-2">
                    <FaClock className="text-emerald-600" />
                    <span className="text-lg">{mounted && dateString}</span>
                  </div>
                  <div className="text-3xl font-bold text-emerald-600 mb-3">{mounted && timeString}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-600">Apt: {userData.apartment || userData.unit || '-'}</span>
                    <span className="text-stone-600">•</span>
                    <span className="text-stone-600">Unit: {userData.unit || userData.apartment || '-'}</span>
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

            {/* Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/maintenance" className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-stone-200/50 hover:bg-white/80 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaTools className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Maintenance</h3>
                  <p className="text-stone-600">Submit and track maintenance requests</p>
                </div>
              </Link>

              <Link href="/amenities" className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-stone-200/50 hover:bg-white/80 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaSwimmingPool className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Amenities</h3>
                  <p className="text-stone-600">Access pool, gym, and facilities</p>
                </div>
              </Link>

              <Link href="/book-lift" className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-stone-200/50 hover:bg-white/80 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaClipboardCheck className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Book Lift</h3>
                  <p className="text-stone-600">Reserve lift for moving items</p>
                </div>
              </Link>

              <Link href="/documents" className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-stone-200/50 hover:bg-white/80 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaFileAlt className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Documents</h3>
                  <p className="text-stone-600">View important building documents</p>
                </div>
              </Link>

              <Link href="/downloads" className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-stone-200/50 hover:bg-white/80 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaDownload className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Downloads</h3>
                  <p className="text-stone-600">Access forms and resources</p>
                </div>
              </Link>

              <Link href="/contact" className="group bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-stone-200/50 hover:bg-white/80 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaPhone className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Contact</h3>
                  <p className="text-stone-600">Get in touch with management</p>
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
            <h3 className="text-2xl font-bold mb-6 text-stone-800">Resident Settings</h3>
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <h4 className="font-semibold text-stone-800 mb-2">Account Information</h4>
                <p className="text-stone-600 text-sm">Manage your resident account settings and preferences.</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-2">Building Status</h4>
                <p className="text-emerald-600 text-sm">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
