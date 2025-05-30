'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';

interface LiftBooking {
  id: string;
  userName?: string;
  userEmail?: string;
  date?: string;
  time?: string;
  status: string;
}

export default function AdminLiftBookingsPage() {
  const [bookings, setBookings] = useState<LiftBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'lift_bookings'), (snap) => {
      setBookings(snap.docs.map(doc => ({
        id: doc.id,
        userName: doc.data().userName || '',
        userEmail: doc.data().userEmail || '',
        date: doc.data().date || '',
        time: doc.data().time || '',
        status: doc.data().status || 'pending',
      })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Lift Bookings</h1>
      <div className="mb-4 text-lg font-semibold text-green-700">{bookings.length} bookings</div>
      {loading ? <div>Loading...</div> : (
        <table className="w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Resident</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="p-3">{b.userName || b.userEmail}</td>
                <td className="p-3">{b.date}</td>
                <td className="p-3">{b.time}</td>
                <td className="p-3">{b.status}</td>
                <td className="p-3">
                  <select
                    className="px-2 py-1 border rounded mr-2"
                    value={b.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      await updateDoc(doc(db, 'lift_bookings', b.id), { status: newStatus });
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 