"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { FaTools, FaSpinner, FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  userName?: string;
  apartment?: string;
  unit?: string;
}

export default function MaintenancePage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/resident');
      return;
    }
    if (user) {
      fetchRequests();
    }
  }, [user, authLoading, router]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'maintenance_requests'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const requestsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          status: data.status,
          createdAt: data.createdAt.toDate(),
          userName: data.userName,
          apartment: data.apartment,
          unit: data.unit,
          userEmail: data.userEmail,
          userId: data.userId,
        };
      }) as MaintenanceRequest[];
      console.log('Loaded requests:', requestsData);
      setRequests(requestsData);
      setError('');
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load maintenance requests. ' + (error instanceof Error ? error.message : ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) {
      setError('Please log in to submit a maintenance request');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const requestData = {
        userId: user.uid,
        title,
        description,
        status: 'pending',
        createdAt: Timestamp.now(),
        unit: userData.unit || userData.apartment || '',
        apartment: userData.apartment || userData.unit || '',
        userName: userData.name || user.displayName || '',
        userEmail: user.email || ''
      };
      console.log('Submitting maintenance request:', requestData);
      await addDoc(collection(db, 'maintenance_requests'), requestData);

      setTitle('');
      setDescription('');
      setShowForm(false);
      await fetchRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      setError('Failed to submit maintenance request. ' + (error instanceof Error ? error.message : ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group requests by status
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const solvingRequests = requests.filter(r => r.status === 'in-progress');
  const solvedRequests = requests.filter(r => r.status === 'completed');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaTools className="text-blue-600" />
          Maintenance Requests
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
            New Request
          </button>
        </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Submit Maintenance Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Brief description of the issue"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
                placeholder="Please provide detailed information about the maintenance issue"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-8">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
          </div>
        ) : (
          <>
            {/* Pending */}
            <h3 className="text-xl font-bold mb-4 text-yellow-700">Pending</h3>
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-center mb-6">No pending requests</p>
            ) : (
              <div className="space-y-4 mb-8">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg text-yellow-900">{request.title}</h4>
                        <p className="text-sm text-gray-500">Submitted on {request.createdAt.toLocaleDateString()}</p>
                        <p className="text-sm text-gray-700">By: {request.userName || '-'} | Apt: {request.apartment || '-'} | Unit: {request.unit || '-'}</p>
                      </div>
                      <span className="text-sm px-2 py-1 rounded-full bg-yellow-200 text-yellow-900">Pending</span>
                    </div>
                    <p className="text-gray-700 text-sm">{request.description}</p>
                  </div>
                ))}
              </div>
            )}
            {/* Solving */}
            <h3 className="text-xl font-bold mb-4 text-blue-700">Solving</h3>
            {solvingRequests.length === 0 ? (
              <p className="text-gray-500 text-center mb-6">No requests in progress</p>
            ) : (
              <div className="space-y-4 mb-8">
                {solvingRequests.map((request) => (
                  <div key={request.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg text-blue-900">{request.title}</h4>
                        <p className="text-sm text-gray-500">Submitted on {request.createdAt.toLocaleDateString()}</p>
                        <p className="text-sm text-gray-700">By: {request.userName || '-'} | Apt: {request.apartment || '-'} | Unit: {request.unit || '-'}</p>
                      </div>
                      <span className="text-sm px-2 py-1 rounded-full bg-blue-200 text-blue-900">Solving</span>
                    </div>
                    <p className="text-gray-700 text-sm">{request.description}</p>
                  </div>
                ))}
              </div>
            )}
            {/* Solved */}
            <h3 className="text-xl font-bold mb-4 text-green-700">Solved</h3>
            {solvedRequests.length === 0 ? (
              <p className="text-gray-500 text-center">No solved requests</p>
            ) : (
              <div className="space-y-4">
                {solvedRequests.map((request) => (
                  <div key={request.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg text-green-900">{request.title}</h4>
                        <p className="text-sm text-gray-500">Submitted on {request.createdAt.toLocaleDateString()}</p>
                        <p className="text-sm text-gray-700">By: {request.userName || '-'} | Apt: {request.apartment || '-'} | Unit: {request.unit || '-'}</p>
                      </div>
                      <span className="text-sm px-2 py-1 rounded-full bg-green-200 text-green-900">Solved</span>
                    </div>
                    <p className="text-gray-700 text-sm">{request.description}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
