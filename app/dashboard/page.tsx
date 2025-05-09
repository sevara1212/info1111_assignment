'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUser, FaHome, FaSwimmingPool, FaFileAlt, FaArrowCircleUp, FaSignOutAlt, FaFileDownload, FaElevator, FaEnvelope, FaTools } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { User } from "@/models/User";

export default function Dashboard() {
  const { user, signOut, userRole } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [userData, setUserData] = useState<User | null>(null);

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
    const fetchUserData = async () => {
      if (!user) return;

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData({ id: docSnap.id, ...docSnap.data() } as User);
      }
    };

    fetchUserData();
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
      icon: FaElevator,
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
      <nav className="fixed top-0 left-0 h-full w-72 bg-white shadow-lg p-6">
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
          {features.map((feature) => (
            <Link 
              key={feature.title}
              href={feature.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all"
            >
              <FaSwimmingPool className="text-xl" />
              <span>{feature.title}</span>
            </Link>
          ))}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-all"
          >
            <FaSignOutAlt className="text-xl" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      <main className="ml-72 p-8">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{greeting}, {userData?.name || 'Resident'}!</h1>
              <p className="text-gray-500 mb-1">{currentDate}</p>
              <p className="text-2xl font-semibold text-gray-900">{currentTime}</p>
              {userData && (
                <p className="text-md mt-2 text-gray-600">
                  Apartment {userData.apartment}, Floor {userData.floor}
                </p>
              )}
            </div>
            <div className="relative w-96 h-48 rounded-xl overflow-hidden">
              <Image
                src="/images/building.png"
                alt="Building"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

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
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-600 mt-1">Active requests</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Lift Bookings
            </h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-600 mt-1">Upcoming bookings</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Notifications
            </h3>
            <p className="text-3xl font-bold text-yellow-600">0</p>
            <p className="text-sm text-gray-600 mt-1">Unread messages</p>
          </div>
        </div>
      </main>
    </div>
  );
}

