'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUser, FaHome, FaSwimmingPool, FaFileAlt, FaArrowCircleUp, FaSignOutAlt, FaFileDownload, FaBuilding, FaEnvelope, FaTools, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { User } from "@/models/User";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [userData, setUserData] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    maintenanceRequests: 0,
    liftBookings: 0,
    notifications: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');

      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData({ id: userDoc.id, ...userDoc.data() } as User);
        }

        // Fetch maintenance requests
        const maintenanceQuery = query(
          collection(db, 'maintenance_requests'),
          where('userId', '==', user.uid),
          where('status', 'in', ['pending', 'in-progress'])
        );
        const maintenanceSnapshot = await getDocs(maintenanceQuery);

        // Fetch lift bookings
        const liftQuery = query(
          collection(db, 'lift_bookings'),
          where('userId', '==', user.uid),
          where('date', '>=', new Date().toISOString().split('T')[0])
        );
        const liftSnapshot = await getDocs(liftQuery);

        // Fetch notifications
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid),
          where('read', '==', false)
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);

        setStats({
          maintenanceRequests: maintenanceSnapshot.size,
          liftBookings: liftSnapshot.size,
          notifications: notificationsSnapshot.size
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const features = [
    {
      title: 'Amenities',
      description: 'Access building amenities and book facilities',
      icon: FaSwimmingPool,
      href: '/amenities',
      color: 'bg-blue-500'
    },
    {
      title: 'Downloads',
      description: 'Download important documents and forms',
      icon: FaFileDownload,
      href: '/downloads',
      color: 'bg-green-500'
    },
    {
      title: 'Book Lift',
      description: 'Schedule lift usage for moving or deliveries',
      icon: FaBuilding,
      href: '/book-lift',
      color: 'bg-purple-500'
    },
    {
      title: 'Contact',
      description: 'Get in touch with building management',
      icon: FaEnvelope,
      href: '/contact',
      color: 'bg-yellow-500'
    },
    {
      title: 'Maintenance',
      description: 'Submit and track maintenance requests',
      icon: FaTools,
      href: '/maintenance',
      color: 'bg-red-500'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access the dashboard</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 h-full w-72 bg-white shadow-lg p-6 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FaUser className="text-blue-600 text-2xl" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome, {userData?.name || 'Resident'}
          </h2>
          <p className="text-sm text-gray-500">Resident Portal</p>
        </div>
        <div className="space-y-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link 
                key={feature.title}
                href={feature.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="text-xl" />
                <span>{feature.title}</span>
              </Link>
            );
          })}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all"
          >
            <FaSignOutAlt className="text-xl" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:ml-72 p-4 lg:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{greeting}, {userData?.name || 'Resident'}!</h1>
              <p className="text-gray-500 mb-1">{currentDate}</p>
              <p className="text-xl lg:text-2xl font-semibold text-gray-900">{currentTime}</p>
              {userData && (
                <p className="text-md mt-2 text-gray-600">
                  Apartment {userData.apartment}, Floor {userData.floor}
                </p>
              )}
            </div>
            <div className="relative w-full lg:w-96 h-48 rounded-xl overflow-hidden">
              <Image
                src="/images/sevara_apartments.png"
                alt="Building"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="block group"
              >
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className={`${feature.color} p-6`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Maintenance Requests
            </h3>
            {isLoading ? (
              <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
            ) : (
              <>
                <p className="text-3xl font-bold text-blue-600">{stats.maintenanceRequests}</p>
                <p className="text-sm text-gray-600 mt-1">Active requests</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Lift Bookings
            </h3>
            {isLoading ? (
              <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
            ) : (
              <>
                <p className="text-3xl font-bold text-purple-600">{stats.liftBookings}</p>
                <p className="text-sm text-gray-600 mt-1">Upcoming bookings</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Notifications
            </h3>
            {isLoading ? (
              <div className="animate-pulse h-8 bg-gray-200 rounded"></div>
            ) : (
              <>
                <p className="text-3xl font-bold text-yellow-600">{stats.notifications}</p>
                <p className="text-sm text-gray-600 mt-1">Unread messages</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

