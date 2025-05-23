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

export default function ContactPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FaEnvelope className="text-blue-600" />
        Contact Building Management
      </h1>

      {/* Contact People Squares */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {contacts.map((contact, idx) => (
          <div key={idx} className="flex flex-col items-center bg-white rounded-xl shadow-md p-4">
            <div className="w-20 h-20 relative mb-3">
              <img
                src={contact.imageUrl}
                alt={contact.name}
                className="w-20 h-20 object-cover rounded-full border-4 border-blue-200"
                onError={(e) => {
                  console.error(`Failed to load image: ${contact.imageUrl}`);
                  e.currentTarget.src = '/images/placeholder.png';
                }}
              />
            </div>
            <div className="text-lg font-semibold text-gray-800">{contact.name}</div>
            <div className="text-sm text-gray-500 mb-1">{contact.position}</div>
            <div className="text-xs text-gray-400">{contact.email}</div>
            <div className="text-xs text-gray-400">{contact.phone}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaPhone className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Phone</h3>
                <p className="text-gray-600">+1 (555) 123-4567</p>
                <p className="text-sm text-gray-500">Available 24/7 for emergencies</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaEnvelope className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Email</h3>
                <p className="text-gray-600">management@strata.com</p>
                <p className="text-sm text-gray-500">Response within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaMapMarkerAlt className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Office Hours</h3>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM</p>
                <p className="text-gray-600">Saturday: 10:00 AM - 2:00 PM</p>
                <p className="text-gray-600">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Send a Message</h2>
          
          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
              Your message has been sent successfully. We'll get back to you soon.
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="What is this regarding?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                required
                placeholder="Please provide details about your inquiry"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
