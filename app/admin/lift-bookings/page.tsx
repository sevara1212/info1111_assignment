'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, Timestamp, where } from 'firebase/firestore';
import { FaElevator, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

interface LiftBooking {
  id: string;
  userId: string;
  apartment: number;
  floor: number;
  date: Date;
  timeSlot: string;
  status: 'pending' | 'approved' | 'rejected';
  purpose: string;
  userName?: string;
}

export default function AdminLiftBookingsPage() {
  const { isAdmin } = useAuth();
  const [bookings, setBookings] = useState<LiftBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchBookings();
    }
  }, [isAdmin]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'lift_bookings'),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const bookingsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          // Fetch user name
          const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', data.userId)));
          const userName = userDoc.docs[0]?.data()?.name || 'Unknown User';
          
          return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            userName
          } as LiftBooking;
        })
      );
      
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load lift bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
    setUpdating(bookingId);
    try {
      await updateDoc(doc(db, 'lift_bookings', bookingId), {
        status,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status }
          : booking
      ));
    } catch (error) {
      console.error('Error updating booking:', error);
      setError('Failed to update booking status');
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
        <FaElevator className="text-blue-600" />
        Lift Bookings
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No lift bookings found</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">
                      Booking for {booking.userName} (Unit {booking.apartment}, Floor {booking.floor})
                    </h3>
                    <p className="text-sm text-gray-500">
                      Date: {booking.date.toLocaleDateString()} at {booking.timeSlot}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Purpose: {booking.purpose}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                      booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'approved')}
                          disabled={updating === booking.id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updating === booking.id ? (
                            <FaSpinner className="animate-spin h-4 w-4" />
                          ) : (
                            <>
                              <FaCheck className="mr-1 h-4 w-4" />
                              Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                          disabled={updating === booking.id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updating === booking.id ? (
                            <FaSpinner className="animate-spin h-4 w-4" />
                          ) : (
                            <>
                              <FaTimes className="mr-1 h-4 w-4" />
                              Reject
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 