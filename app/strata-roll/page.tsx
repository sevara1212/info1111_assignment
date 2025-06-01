'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { FaUsers, FaSearch, FaSpinner, FaUser, FaHome, FaEnvelope } from 'react-icons/fa';
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
    
    // Only fetch residents, not admins
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'resident'),
      orderBy('name')
    );
    
    const unsub = onSnapshot(q, (snap) => {
      const userData = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Owner));
      setUnits(userData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching residents:', error);
      // Fallback to getDocs if orderBy fails due to missing index
      getDocs(collection(db, 'users')).then(snap => {
        const userData = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Owner))
          .filter(user => user.role === 'resident'); // Client-side filtering
        setUnits(userData);
        setLoading(false);
      }).catch(err => {
        console.error('Fallback query also failed:', err);
        setError('Failed to load resident data');
        setLoading(false);
      });
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
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-600 mx-auto mb-4" />
          <span className="text-lg text-stone-700">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-emerald-50 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-xl border border-red-200 rounded-2xl p-8 text-center shadow-xl max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-red-600">
            You don't have permission to view the resident directory.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-emerald-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl p-8 mb-8 border border-stone-200/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                <FaUsers className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-stone-800">Resident Directory</h1>
                <p className="text-stone-600 text-lg">Building community members</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-semibold">
                  {units.length} Residents
                </div>
                <div className="text-stone-600">
                  Active building residents only
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
                <input
                  className="pl-10 pr-4 py-3 border border-stone-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 w-80"
                  placeholder="Search by name, email, or unit..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-16 border border-stone-200/50">
              <div className="flex flex-col items-center justify-center">
                <FaSpinner className="animate-spin text-4xl text-emerald-600 mb-4" />
                <p className="text-stone-600 text-lg">Loading resident directory...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-red-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUsers className="text-3xl text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-600 mb-2">Failed to Load</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg p-16 border border-stone-200/50">
              <div className="text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSearch className="text-3xl text-stone-400" />
                </div>
                <h3 className="text-xl font-bold text-stone-600 mb-2">No Results Found</h3>
                <p className="text-stone-500">
                  {search ? `No residents match "${search}"` : 'No residents found'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-stone-200/50 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filtered.map((resident) => (
                  <div key={resident.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-stone-200/50 hover:bg-white hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {resident.name?.charAt(0)?.toUpperCase() || 'R'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-stone-800 text-lg mb-1 truncate">
                          {resident.name || 'Unknown Resident'}
                        </h3>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-stone-600">
                            <FaEnvelope className="text-xs" />
                            <span className="text-sm truncate">{resident.email}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-stone-600">
                            <FaHome className="text-xs" />
                            <span className="text-sm">
                              Unit {resident.unit || resident.apartment || 'N/A'}
                            </span>
                          </div>
                          
                          {resident.entitlements && (
                            <div className="text-xs text-stone-500">
                              Entitlements: {resident.entitlements}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                            Resident
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 