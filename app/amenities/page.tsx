"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaClock, FaDollarSign, FaSpinner, FaCheck, FaCreditCard, FaTimes } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "firebase/firestore";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';

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
  stripePaymentIntentId?: string;
}

// Payment form component that uses Stripe Elements
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
  const stripe = useStripe();
  const elements = useElements();
  const { user, userData } = useAuth();
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user || !userData) {
      onError('Payment system not ready. Please try again.');
      return;
    }

    if (!cardholderName.trim()) {
      onError('Please enter the cardholder name');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card information not found');
      return;
    }

    setLoading(true);

    try {
      // Create payment intent on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 5, // $5
          amenityName: selectedAmenity.name,
          userEmail: userData.email || user.email,
        }),
      });

      const { clientSecret, error: serverError } = await response.json();

      if (serverError) {
        onError(serverError);
        return;
      }

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName,
            email: userData.email || user.email,
          },
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        // Payment successful - the webhook will handle saving to Firestore
        onSuccess();
      }
    } catch (error: any) {
      onError('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
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
          Card Information *
        </label>
        <div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
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
          disabled={!stripe || loading}
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
        Your payment information is secure and encrypted. Powered by Stripe.
      </p>
    </form>
  );
}

export default function AmenitiesPage() {
  const { user, userData } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<{id: string, name: string} | null>(null);

  const amenities = [
    {
      name: "Swimming Pool",
      description: "Our luxurious swimming pool is perfect for both exercise and relaxation. Featuring temperature-controlled water and dedicated lap lanes.",
      image: "/images/poolindoor.png",
      hours: "6:00 AM - 10:00 PM",
      features: ["Temperature Controlled", "Lap Lanes", "Pool Deck", "Shower Facilities"],
      price: 5,
      id: "pool"
    },
    {
      name: "Gymnasium",
      description: "State-of-the-art gym equipped with cardio machines, free weights, and dedicated areas for stretching and functional training.",
      image: "/images/gym.png",
      hours: "24/7 Access",
      features: ["Modern Equipment", "Cardio Area", "Free Weights", "Personal Training"],
      price: 5,
      id: "gym"
    }
  ];

  useEffect(() => {
    if (user && userData) {
      fetchUserPayments();
    }
  }, [user, userData]);

  const fetchUserPayments = async () => {
    if (!user || !userData) return;
    
    try {
      const q = query(
        collection(db, 'amenity_payments'),
        where('userEmail', '==', userData.email || user.email),
        orderBy('paidAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const userPayments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
      setPayments(userPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const openPaymentModal = (amenityId: string, amenityName: string) => {
    if (!user || !userData) {
      setError('Please log in to make a payment');
      return;
    }
    setSelectedAmenity({ id: amenityId, name: amenityName });
    setShowPaymentModal(true);
    setError('');
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedAmenity(null);
  };

  const handlePaymentSuccess = () => {
    setSuccess(`Payment successful! You now have access to ${selectedAmenity?.name}.`);
    fetchUserPayments(); // Refresh payments list
    closePaymentModal();
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccess(null), 5000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const hasRecentPayment = (amenityName: string) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return payments.some(payment => 
      payment.amenity === amenityName && 
      payment.status === 'paid' &&
      payment.paidAt?.toDate?.() > sevenDaysAgo
    );
  };

  const getLastPaymentDate = (amenityName: string) => {
    const payment = payments.find(p => p.amenity === amenityName && p.status === 'paid');
    return payment?.paidAt?.toDate?.()?.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
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

                <Elements stripe={stripePromise}>
                  <PaymentForm
                    selectedAmenity={selectedAmenity}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onCancel={closePaymentModal}
                    loading={loading}
                    setLoading={setLoading}
                  />
                </Elements>
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
