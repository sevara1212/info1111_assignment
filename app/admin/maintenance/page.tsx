'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';

interface MaintenanceRequest {
  id: string;
  userName?: string;
  userEmail?: string;
  title?: string;
  status: string;
}

export default function AdminMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRequestIds, setNewRequestIds] = useState<Set<string>>(new Set());
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'maintenance_requests'), (snap) => {
      const newRequests = snap.docs.map(doc => ({
        id: doc.id,
        userName: doc.data().userName || '',
        userEmail: doc.data().userEmail || '',
        title: doc.data().title || '',
        status: doc.data().status || 'pending',
      }));
      
      // Detect new requests (only after initial load)
      if (!loading) {
        const currentIds = new Set(requests.map(r => r.id));
        const incomingIds = new Set(newRequests.map(r => r.id));
        const newIds = new Set([...incomingIds].filter(id => !currentIds.has(id)));
        
        if (newIds.size > 0) {
          // Highlight new requests
          setNewRequestIds(newIds);
          
          // Show top notification
          const newRequest = newRequests.find(r => newIds.has(r.id));
          setNotificationMessage(`New maintenance request from ${newRequest?.userName || 'Unknown'}: ${newRequest?.title || 'No title'}`);
          setShowNotification(true);
          
          // Play notification sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => console.log('Could not play notification sound'));
          
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification('New Maintenance Request', {
              body: `${newIds.size} new maintenance request(s) received`,
              icon: '/favicon.ico'
            });
          }
          
          // Remove highlight after 5 seconds
          setTimeout(() => {
            setNewRequestIds(new Set());
          }, 5000);

          // Hide top notification after 6 seconds
          setTimeout(() => {
            setShowNotification(false);
          }, 6000);
        }
      }
      
      setRequests(newRequests);
      setLoading(false);
    });
    return () => unsub();
  }, [requests, loading]);

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const openCount = requests.filter(r => r.status !== 'completed').length;

  return (
    <div className="max-w-5xl mx-auto p-8 relative">
      {/* Top Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl border-l-4 border-green-400 max-w-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-300 rounded-full mr-3 animate-pulse"></div>
                <div>
                  <div className="font-semibold text-sm">New Request!</div>
                  <div className="text-sm opacity-90">{notificationMessage}</div>
                </div>
              </div>
              <button 
                onClick={() => setShowNotification(false)}
                className="ml-4 text-green-200 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Maintenance Requests</h1>
      <div className="mb-4 text-lg font-semibold text-green-700">{openCount} open</div>
      {loading ? <div>Loading...</div> : (
        <table className="w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Resident</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className={`border-b transition-all duration-500 ${
                newRequestIds.has(req.id) 
                  ? 'bg-green-50 border-green-200 animate-pulse shadow-lg' 
                  : 'hover:bg-gray-50'
              }`}>
                <td className="p-3">{req.userName || req.userEmail}</td>
                <td className="p-3">{req.title}</td>
                <td className="p-3">{req.status}</td>
                <td className="p-3">
                  <select
                    className="px-2 py-1 border rounded mr-2"
                    value={req.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      await updateDoc(doc(db, 'maintenance_requests', req.id), { status: newStatus });
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in process">In Process</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
} 