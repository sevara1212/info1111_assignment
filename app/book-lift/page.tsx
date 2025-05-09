"use client";

import { useState } from 'react';
import { FaArrowCircleUp } from 'react-icons/fa';

export default function BookLift() {
  const [unit, setUnit] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [response, setResponse] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/book-lift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unit, date, time, duration }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setResponse({ message: 'Booking successful!', type: 'success' });
        // Reset form
        setUnit('');
        setDate('');
        setTime('');
        setDuration('30');
      } else {
        setResponse({ message: data.error || 'Booking failed', type: 'error' });
      }
    } catch (error) {
      setResponse({ message: 'An error occurred', type: 'error' });
    }
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
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Enter your unit number"
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
        </div>
      </div>
    </div>
  );
} 