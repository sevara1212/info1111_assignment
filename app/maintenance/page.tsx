"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { FaTools, FaSpinner, FaPlus } from 'react-icons/fa';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
}

export default function MaintenancePage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'maintenance_requests'),
        where('userId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as MaintenanceRequest[];
      
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'maintenance_requests'), {
        userId: user?.uid,
        title,
        description,
        status: 'pending',
        createdAt: Timestamp.now()
      });

      setTitle('');
      setDescription('');
      setShowForm(false);
      fetchRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      setError('Failed to submit maintenance request');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        ) : requests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No maintenance requests found</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{request.title}</h3>
                    <p className="text-sm text-gray-500">
                      Submitted on {request.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{request.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
