'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

export default function LoginResident() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Verify user role in Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'resident') {
            // Set auth token and role
            document.cookie = `auth=${user.uid}; path=/`;
            document.cookie = `userRole=resident; path=/`;
            window.location.href = '/dashboard';
          } else {
            // If user exists but is not a resident, sign them out
            await auth.signOut();
            setError('Access denied. This account is not registered as a resident.');
          }
        } catch (err) {
          console.error('Error checking user role:', err);
          setError('Error verifying user role');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // First, try to sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Then verify the user's role in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User account not found');
      }

      const userData = userDoc.data();
      if (userData.role !== 'resident') {
        // If user is not a resident, sign them out
        await auth.signOut();
        throw new Error('Access denied. This account is not registered as a resident.');
      }

      // Set auth token and role in cookies
      document.cookie = `auth=${user.uid}; path=/`;
      document.cookie = `userRole=resident; path=/`;

      // Force a hard navigation to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login error:', err);
      // Handle specific Firebase auth errors
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        default:
          setError(err.message || 'Failed to login');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h2 className="text-2xl font-bold mb-4">Resident Login</h2>

      <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
          disabled={isLoading}
        />
        <button 
          className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50" 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link 
            href="/auth/signup/resident" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
} 