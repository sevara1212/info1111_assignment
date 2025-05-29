"use client";

import { useState, useEffect } from 'react';
import { FaArrowCircleUp } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';

export default function BookLift() {
  const { userData, user } = useAuth();
  const [unit, setUnit] = useState(userData?.unit || userData?.apartment || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [response, setResponse] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnit(userData?.unit || userData?.apartment || '');
  }, [userData]);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchPendingBookings();
    }
  }, [user]);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'lift_bookings'),
        where('userEmail', '==', user?.email),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingBookings = async () => {
    try {
      const q = query(
        collection(db, 'lift_bookings'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Pending bookings:', data);
      setPendingBookings(data);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setResponse({ message: 'You must be logged in to book the lift.', type: 'error' });
      return;
    }
    try {
      await addDoc(collection(db, 'lift_bookings'), {
        userId: user.uid,
        userEmail: user.email,
        unit,
        date,
        time,
        duration,
        status: 'pending',
        createdAt: Timestamp.now()
      });
      setResponse({ message: 'Booking successful! Your request is being processed.', type: 'success' });
      setDate('');
      setTime('');
      setDuration('30');
      await fetchBookings();
    } catch (error) {
      setResponse({ message: 'An error occurred', type: 'error' });
    }
  };

  const generateCertificate = async () => {
    if (!userData) return;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const name = userData.name;
    const unit = userData.unit || userData.apartment || '-';
    const date = new Date().toLocaleDateString();
    const certId = uuidv4();

    page.drawText('Certificate of Residency', {
      x: 150, y: 350, size: 24, font, color: rgb(0, 0, 0.7)
    });

    page.drawText(
      `This is to certify that ${name} resides at unit ${unit} and is an approved resident of Sevara Apartments.`,
      { x: 50, y: 300, size: 14, font, color: rgb(0, 0, 0) }
    );

    page.drawText(`Date of Issue: ${date}`, { x: 50, y: 250, size: 12, font });
    page.drawText(`Certificate ID: ${certId}`, { x: 50, y: 230, size: 12, font });

    page.drawText('Sevara Apartments Management', { x: 50, y: 180, size: 14, font, color: rgb(0, 0, 0.7) });

    // Optionally, add a QR code or hash here

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate_of_Residency_${name}_${unit}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 gradient-border inline-block">
            Book Moving Lift
          </h1>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                Unit Number
              </label>
              <input
                type="text"
                id="unit"
                className="input"
                value={unit}
                disabled
                readOnly
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  className="input"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <select
                id="duration"
                className="input"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            {response && (
              <div className={`rounded-lg p-4 ${
                response.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {response.message}
              </div>
            )}

            <button type="submit" className="button w-full">
              Book Lift
            </button>
          </form>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Guidelines
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Bookings must be made at least 24 hours in advance
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Maximum booking duration is 2 hours
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Available between 9:00 AM and 5:00 PM
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                Please be punctual for your booking
              </li>
            </ul>
          </div>

          <div className="mt-8 bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">
              Pending Bookings
            </h3>
            {pendingBookings.length === 0 ? (
              <div className="text-gray-500">No pending bookings.</div>
            ) : (
              <ul className="space-y-4">
                {pendingBookings.map(booking => (
                  <li key={booking.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-semibold">{booking.date} at {booking.time} ({booking.duration} min)</div>
                        <div className="text-sm text-gray-600">Unit: {booking.unit} | Apt: {booking.apartment || '-'}</div>
                        <div className="text-sm text-gray-700">Requested by: {booking.userName || booking.userEmail}</div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Lift Bookings
            </h3>
            {loading ? (
              <div>Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="text-gray-500">No bookings found.</div>
            ) : (
              <ul className="space-y-4">
                {bookings.map(booking => (
                  <li key={booking.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-semibold">{booking.date} at {booking.time} ({booking.duration} min)</div>
                        <div className="text-sm text-gray-600">Unit: {booking.unit} | Apt: {booking.apartment}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                        booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status === 'pending' ? 'Being processed' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">Requested by: {booking.userName}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 