"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

const contacts = [
  {
    position: "Security",
    name: "Security Team",
    shortName: "CS",
    email: "security@sevara.apartments",
    phone: "04 0000 0001",
    bgColor: "bg-[#2E6DB4]",
    imageUrl: "/images/security.png",
  },
  {
    position: "Strata Manager",
    name: "Strata Management",
    shortName: "SM",
    email: "stratamanager@sevara.apartments",
    phone: "04 0000 0002",
    bgColor: "bg-[#2E6DB4]",
    imageUrl: "/images/stratamanager.png",
  },
  {
    position: "Building Manager",
    shortName: "CM",
    email: "buildingmanager@sevara.apartments",
    phone: "04 0000 0003",
    bgColor: "bg-[#2E6DB4]",
    imageUrl: "/images/buildingmanager.png",
  },
  {
    position: "Chairperson",
    name: "Chairperson",
    shortName: "CH",
    email: "chairperson@sevara.apartments",
    phone: "04 0000 0004",
    bgColor: "bg-[#2E6DB4]",
    imageUrl: "/images/chairperson.png",
  },
  {
    position: "Secretary",
    name: "Secretary",
    shortName: "SC",
    email: "secretary@sevara.apartments",
    phone: "04 0000 0005",
    bgColor: "bg-[#2E6DB4]",
    imageUrl: "/images/secretary.png",
  },
  {
    position: "Treasurer",
    name: "Treasurer",
    shortName: "TR",
    email: "treasurer@sevara.apartments",
    phone: "04 0000 0006",
    bgColor: "bg-[#2E6DB4]",
    imageUrl: "/images/treasurer.png",
  },
];

const ROLES = [
  'Security',
  'Strata Management',
  'Building Management',
  'Chairperson',
  'Treasurer',
  'Secretary',
];

export default function ContactPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recipient, setRecipient] = useState(ROLES[0]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/resident');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to send a message');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await addDoc(collection(db, 'contact_messages'), {
        userId: user.uid,
        userEmail: user.email,
        subject,
        message,
        status: 'unread',
        createdAt: Timestamp.now()
      });

      setSubject('');
      setMessage('');
      setSuccess(true);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#16213e] py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold mb-2 text-[#16213e]">Contact Information</h1>
        <div className="mb-6 text-[#16213e]">
          <div className="font-semibold">Available 24/7 for emergencies</div>
          <div className="text-lg font-bold mt-1">Contact: +1 (555) 123-4567</div>
        </div>
        <h2 className="text-xl font-bold mb-4 text-[#16213e]">Send a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#16213e] mb-1">Send to</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              required
            >
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#16213e] mb-1">Subject</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
              placeholder="What is this regarding?"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#16213e] mb-1">Message</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-700"
              placeholder="Please provide details about your inquiry"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-3 rounded-md font-semibold text-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
          {success && <div className="text-green-600 text-center font-medium">Message sent successfully!</div>}
          {error && <div className="text-red-600 text-center font-medium">{error}</div>}
        </form>
      </div>
    </div>
  );
}
