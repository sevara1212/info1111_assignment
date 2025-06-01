"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaClock, FaSpinner, FaCheck, FaCreditCard, FaTimes } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore";

interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  apartment: string;
  amenity: string;
  amount: number;
  paidAt: any;
  status: 'paid' | 'pending';
  paymentMethod?: {
    type: string;
    last4: string;
    brand: string;
  };
}

// Simple payment form component
function PaymentForm({ 
  selectedAmenity, 
  onSuccess, 
  onError, 
  onCancel,
  loading,
  setLoading 
}: {
  selectedAmenity: {id: string, name: string};
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}) {
  const { user, userData } = useAuth();
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user || !userData) {
      onError('Please log in to make a payment');
      return;
    }

    if (!cardholderName.trim() || !cardNumber.trim() || !expiryDate.trim() || !cvv.trim()) {
      onError('Please fill in all payment details');
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save payment to Firestore
      await addDoc(collection(db, 'amenity_payments'), {
        userId: user.uid,
        userEmail: userData.email || user.email,
        userName: userData.name || 'Unknown',
        apartment: userData.apartment?.toString() || 'Unknown',
        amenity: selectedAmenity.name,
        amount: 5,
        paidAt: serverTimestamp(),
        status: 'paid',
        paymentMethod: {
          type: 'card',
          last4: cardNumber.slice(-4),
          brand: getCardBrand(cardNumber)
        }
      });

      onSuccess();
    } catch (error: any) {
      onError('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCardBrand = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    return 'Card';
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">Weekly Access</span>
          <span className="text-xl font-bold text-blue-600">$5.00</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          7-day access to {selectedAmenity.name}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder Name *
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Number *
        </label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date *
          </label>
          <input
            type="text"
            value={expiryDate}
            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV *
          </label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
            placeholder="123"
            maxLength={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FaCreditCard />
              Pay $5.00
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        This is a demo payment system. No real charges will be made.
      </p>
    </form>
  );
}

export default function AmenitiesPage() {
  const { user, userData } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<{id: string, name: string} | null>(null);

  const amenities = [
    {
      id: "gym",
      name: "Fitness Center",
      description: "State-of-the-art gym with modern equipment, free weights, and cardio machines.",
      price: 5,
      hours: "24/7",
      image: "/images/gym.jpg",
      features: ["Cardio Equipment", "Free Weights", "Machines", "24/7 Access"]
    },
    {
      id: "pool",
      name: "Swimming Pool",
      description: "Olympic-sized swimming pool with lane markers and poolside seating area.",
      price: 5,
      hours: "6:00 AM - 10:00 PM",
      image: "/images/pool.jpg",
      features: ["Olympic Size", "Lane Markers", "Poolside Seating", "Changing Rooms"]
    }
  ];

  useEffect(() => {
    if (user && userData) {
      fetchPayments();
    }
  }, [user, userData]);

  const fetchPayments = async () => {
    if (!user || !userData) return;

    try {
      const q = query(
        collection(db, "amenity_payments"),
        where("userId", "==", user.uid),
        orderBy("paidAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const paymentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
      
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const hasRecentPayment = (amenityName: string) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return payments.some(payment => 
      payment.amenity === amenityName && 
      payment.status === 'paid' &&
      payment.paidAt?.toDate?.() > oneWeekAgo
    );
  };

  const getLastPaymentDate = (amenityName: string) => {
    const amenityPayments = payments.filter(p => p.amenity === amenityName && p.status === 'paid');
    if (amenityPayments.length === 0) return null;
    
    const lastPayment = amenityPayments[0]; // Already sorted by date desc
    return lastPayment.paidAt?.toDate?.()?.toLocaleDateString();
  };

  const openPaymentModal = (amenityId: string, amenityName: string) => {
    setSelectedAmenity({ id: amenityId, name: amenityName });
    setShowPaymentModal(true);
    setError("");
    setSuccess("");
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedAmenity(null);
    setError("");
  };

  const handlePaymentSuccess = () => {
    setSuccess("Payment successful! You now have access to the amenity.");
    setShowPaymentModal(false);
    setSelectedAmenity(null);
    
    // Refresh payments
    fetchPayments();
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(""), 5000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to view and access amenities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Building Amenities
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Access our premium amenities with a weekly fee of $5 per facility
        </p>

        {error && (
          <div className="max-w-md mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="max-w-md mx-auto mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <FaCheck className="text-green-600" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {amenities.map((amenity, index) => {
            const hasAccess = hasRecentPayment(amenity.name);
            const lastPayment = getLastPaymentDate(amenity.name);
            
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative h-[400px] w-full">
                  <Image
                    src={amenity.image}
                    alt={amenity.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full font-semibold">
                    ${amenity.price}/week
                  </div>
                </div>
                
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {amenity.name}
                  </h2>
                  
                  <p className="text-gray-600 mb-6">
                    {amenity.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {amenity.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-6">
                    <FaClock className="mr-2" />
                    <span className="text-sm">Hours: {amenity.hours}</span>
                  </div>

                  {/* Access Status */}
                  <div className="mb-4">
                    {hasAccess ? (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaCheck className="text-green-600" />
                          <span className="font-medium">Access Granted</span>
                        </div>
                        {lastPayment && (
                          <p className="text-sm mt-1">Last payment: {lastPayment}</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                        <p className="font-medium">Payment required for access</p>
                        <p className="text-sm mt-1">$5 provides 7-day access to this facility</p>
                      </div>
                    )}
                  </div>

                  {/* Payment Button */}
                  <button
                    onClick={() => openPaymentModal(amenity.id, amenity.name)}
                    disabled={hasAccess}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      hasAccess
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {hasAccess ? (
                      <>
                        <FaCheck />
                        Access Active
                      </>
                    ) : (
                      <>
                        <FaCreditCard />
                        Pay $5 for Access
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedAmenity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Payment for {selectedAmenity.name}
                  </h3>
                  <button
                    onClick={closePaymentModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <PaymentForm
                  selectedAmenity={selectedAmenity}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={closePaymentModal}
                  loading={loading}
                  setLoading={setLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Amenity</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Payment Method</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-2">
                        {payment.paidAt?.toDate?.()?.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{payment.amenity}</td>
                      <td className="px-4 py-2">${payment.amount}</td>
                      <td className="px-4 py-2">
                        {payment.paymentMethod ? 
                          `${payment.paymentMethod.brand} ****${payment.paymentMethod.last4}` : 
                          'Card'
                        }
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
