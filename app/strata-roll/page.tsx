'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { FaUsers, FaSearch, FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface Owner {
  id: string;
  name?: string;
  email?: string;
  apartment?: number;
  unit?: string;
  floor?: number;
  entitlements?: number;
  role?: 'admin' | 'resident';
}

export default function StrataRollPage() {
  const { userData, isAdmin } = useAuth();
  const router = useRouter();
  const [units, setUnits] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before showing dynamic content
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!userData) {
      router.push('/auth/admin');
      return;
    }
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const userData = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Owner));
      setUnits(userData);
      setLoading(false);
    });
    return () => unsub();
  }, [userData, isAdmin, router, mounted]);

  const filtered = units.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    (u.apartment + '').includes(search) ||
    (u.unit + '').includes(search)
  );

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-blue-600 text-2xl" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-red-600">
            You don't have permission to view the strata roll.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Resident Directory</h1>
      <div className="mb-4 text-lg font-semibold text-green-700">{units.length} units</div>
      <input
        className="mb-4 px-4 py-2 border rounded w-full"
        placeholder="Search by name, email, unit..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-blue-600 text-2xl" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No units found</p>
      ) : (
        <table className="w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Unit</th>
              <th className="p-3 text-left">Entitlement</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.unit || u.apartment}</td>
                <td className="p-3">{u.entitlements || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 