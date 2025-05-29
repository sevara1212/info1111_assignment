'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaSpinner, FaTools, FaSwimmingPool, FaClipboardCheck, FaDownload, FaPhone, FaHome } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || !userData) {
        window.location.href = '/resident/login';
      } else if (userData.role !== 'resident') {
        window.location.href = '/resident/login';
      }
    }
  }, [user, userData, loading]);

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

  // Date and time
  const now = new Date();
  const dateString = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeString = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

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
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#232c43] hover:bg-blue-600 transition font-medium text-base mb-1"><FaHome /> Dashboard</Link>
          <Link href="/maintenance" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#232c43] transition font-medium text-base mb-1"><FaTools /> Maintenance</Link>
          <Link href="/amenities" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#232c43] transition font-medium text-base mb-1"><FaSwimmingPool /> Amenities</Link>
          <Link href="/book-lift" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#232c43] transition font-medium text-base mb-1"><FaClipboardCheck /> Book Lift</Link>
          <Link href="/downloads" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#232c43] transition font-medium text-base mb-1"><FaDownload /> Downloads</Link>
          <Link href="/contact" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#232c43] transition font-medium text-base"><FaPhone /> Contact</Link>
        </nav>
        <div className="mt-auto w-full px-4 flex flex-col gap-2">
          <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-800 hover:bg-blue-600 transition font-medium text-base mb-1 mt-8"><span>Settings</span></button>
          <button onClick={async () => { await router.push('/'); location.reload(); }} className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition font-medium text-base"><span>Sign Out</span></button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-3xl font-bold mb-2 leading-tight text-gray-900">Good evening, Welcome to Sevara Apartments</h2>
            <div className="text-gray-600 mb-1 text-lg">{dateString}</div>
            <div className="text-3xl font-bold text-blue-800">{timeString}</div>
          </div>
          <div className="mt-4 md:mt-0 md:ml-8 flex-shrink-0">
            <Image src="/images/sevara_apartments.jpg" alt="Building" width={320} height={180} className="rounded-lg object-cover shadow-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-8">
          <Link href="/maintenance" className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center hover:bg-blue-50 transition cursor-pointer min-h-[220px] border border-blue-100">
            <FaTools className="text-5xl mb-4 text-blue-700" />
            <div className="font-semibold text-xl">Maintenance</div>
          </Link>
          <Link href="/amenities" className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center hover:bg-blue-50 transition cursor-pointer min-h-[220px] border border-blue-100">
            <FaSwimmingPool className="text-5xl mb-4 text-blue-700" />
            <div className="font-semibold text-xl">Amenities</div>
          </Link>
          <Link href="/book-lift" className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center hover:bg-blue-50 transition cursor-pointer min-h-[220px] border border-blue-100">
            <FaClipboardCheck className="text-5xl mb-4 text-blue-700" />
            <div className="font-semibold text-xl">Book Lift</div>
          </Link>
          <Link href="/downloads" className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center hover:bg-blue-50 transition cursor-pointer min-h-[220px] border border-blue-100">
            <FaDownload className="text-5xl mb-4 text-blue-700" />
            <div className="font-semibold text-xl">Downloads</div>
          </Link>
          <Link href="/contact" className="bg-white rounded-2xl shadow-lg p-12 flex flex-col items-center hover:bg-blue-50 transition cursor-pointer min-h-[220px] border border-blue-100">
            <FaPhone className="text-5xl mb-4 text-blue-700" />
            <div className="font-semibold text-xl">Contact</div>
          </Link>
        </div>
        {/* Settings Modal Placeholder */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
              <button onClick={() => setShowSettings(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
              <h3 className="text-xl font-bold mb-4">Settings (Coming Soon)</h3>
              <p className="text-gray-600">Here you will be able to update your profile and change your password.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
