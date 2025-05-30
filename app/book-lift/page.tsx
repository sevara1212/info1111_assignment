"use client";

import { useState, useEffect } from 'react';
import { FaArrowCircleUp, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, Timestamp, onSnapshot } from 'firebase/firestore';
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
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setUnit(userData?.unit || userData?.apartment || '');
  }, [userData]);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchPendingBookings();
      fetchAllBookings();
    }
  }, [user]);

  useEffect(() => {
    fetchPendingBookings();
    fetchAllBookings();
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

  const fetchAllBookings = async () => {
    try {
      const q = query(
        collection(db, 'lift_bookings'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllBookings(data);
    } catch (error) {
      console.error('Error fetching all bookings:', error);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getBookingsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return allBookings.filter(booking => booking.date === dateString);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayBookings = getBookingsForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;
      
      days.push(
        <div key={day} className={`h-24 border border-gray-200 p-1 ${isToday ? 'bg-blue-50 border-blue-300' : ''} ${isPast ? 'bg-gray-50' : ''}`}>
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : isPast ? 'text-gray-400' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayBookings.slice(0, 2).map((booking, index) => (
              <div
                key={booking.id}
                className={`text-xs px-1 py-0.5 rounded truncate ${
                  booking.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : booking.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
                title={`${booking.time} - Unit ${booking.unit} (${booking.status})`}
              >
                {booking.time} - {booking.unit}
              </div>
            ))}
            {dayBookings.length > 2 && (
              <div className="text-xs text-gray-500">+{dayBookings.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
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

          {/* Calendar View Toggle */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaCalendarAlt />
              {showCalendar ? 'Hide Calendar' : 'View Booking Calendar'}
            </button>
          </div>

          {/* Calendar View */}
          {showCalendar && mounted && (
            <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Lift Bookings Calendar
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaChevronLeft className="text-gray-600" />
                  </button>
                  <h4 className="text-lg font-medium text-gray-800 min-w-[200px] text-center">
                    {mounted ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Loading...'}
                  </h4>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaChevronRight className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                  <span>Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                  <span>Rejected</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-gray-100 p-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                    {day}
                  </div>
                ))}
                {/* Calendar days */}
                {renderCalendar()}
              </div>
            </div>
          )}

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
            <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-yellow-600" />
              Your Pending Bookings
            </h3>
            {bookings.filter(b => b.status === 'pending').length === 0 ? (
              <div className="text-gray-500">No pending bookings.</div>
            ) : (
              <ul className="space-y-4">
                {bookings.filter(b => b.status === 'pending').map(booking => (
                  <li key={booking.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">{booking.date} at {booking.time}</div>
                        <div className="text-sm text-gray-600">Duration: {booking.duration} minutes</div>
                        <div className="text-sm text-gray-600">Unit: {booking.unit} | Apt: {booking.apartment || '-'}</div>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                        Pending Approval
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Submitted: {booking.createdAt?.toDate?.()?.toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
              <FaArrowCircleUp className="text-green-600" />
              Your Approved Bookings
            </h3>
            {bookings.filter(b => b.status === 'approved').length === 0 ? (
              <div className="text-gray-500">No approved bookings.</div>
            ) : (
              <ul className="space-y-4">
                {bookings.filter(b => b.status === 'approved').map(booking => (
                  <li key={booking.id} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">{booking.date} at {booking.time}</div>
                        <div className="text-sm text-gray-600">Duration: {booking.duration} minutes</div>
                        <div className="text-sm text-gray-600">Unit: {booking.unit} | Apt: {booking.apartment || '-'}</div>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                        Approved
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Approved: {booking.updatedAt?.toDate?.()?.toLocaleDateString() || booking.createdAt?.toDate?.()?.toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Your Lift Bookings
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