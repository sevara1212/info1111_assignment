'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, userData, signIn, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && userData && userData.role === 'admin') {
      window.location.href = '/admin/dashboard';
    }
  }, [user, userData, authLoading]);

  useEffect(() => {
    if (!authLoading && user && userData && userData.role !== 'admin') {
      setError('Access denied. This account is not registered as an admin.');
    }
  }, [user, userData, authLoading]);

  useEffect(() => {
    if (user) {
      signOut();
    }
  }, [user, signOut]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-green-600" />
        <span className="ml-4 text-lg text-gray-700">Loading...</span>
      </div>
    );
  }

  if (user && userData && userData.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-green-600" />
        <span className="ml-4 text-lg text-gray-700">Redirecting...</span>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={loading}
            />
          </div>
          <button
            className="w-full bg-green-600 text-white py-2 rounded-md flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-green-700 transition-colors"
            type="submit"
            disabled={loading}
          >
            {loading ? (<><FaSpinner className="animate-spin" /> Logging in...</>) : 'Login'}
          </button>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">{error}</div>
          )}
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup/admin" className="text-green-600 hover:text-green-800 font-medium">Create Admin Account</Link>
          </p>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 mt-4 inline-block">Back to Home</Link>
        </div>
      </div>
    </div>
  );
} 