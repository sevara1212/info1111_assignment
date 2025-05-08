'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, Timestamp, where } from 'firebase/firestore';
import { FaTools, FaSpinner, FaCheck } from 'react-icons/fa';

interface MaintenanceRequest {
  id: string;
  userId: string;
  apartment: number;
  floor: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  userName?: string;
}

export default function AdminMaintenancePage() {
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'maintenance_requests'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requestsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          // Fetch user name
          const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', data.userId)));
          const userName = userDoc.docs[0]?.data()?.name || 'Unknown User';
          
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            userName
          } as MaintenanceRequest;
        })
      );
      
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsFinished = async (requestId: string) => {
    setUpdating(requestId);
    try {
      await updateDoc(doc(db, 'maintenance_requests', requestId), {
        status: 'completed',
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setRequests(requests.map(request => 
        request.id === requestId 
          ? { ...request, status: 'completed' }
          : request
      ));
    } catch (error) {
      console.error('Error updating request:', error);
      setError('Failed to update request status');
    } finally {
      setUpdating(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-red-600">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FaTools className="text-blue-600" />
        Maintenance Requests
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
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
                      From: {request.userName} (Unit {request.apartment}, Floor {request.floor})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      request.status === 'completed' ? 'bg-green-100 text-green-800' :
                      request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    {request.status !== 'completed' && (
                      <button
                        onClick={() => handleMarkAsFinished(request.id)}
                        disabled={updating === request.id}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === request.id ? (
                          <FaSpinner className="animate-spin h-4 w-4" />
                        ) : (
                          <>
                            <FaCheck className="mr-1 h-4 w-4" />
                            Mark as Finished
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                <p className="text-gray-500 text-xs">
                  Submitted on {request.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 