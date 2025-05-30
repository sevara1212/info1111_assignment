import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      try {
        // Get payment method details
        let paymentMethodDetails = {
          type: 'stripe',
          last4: 'Unknown',
          brand: 'Unknown'
        };

        if (paymentIntent.payment_method) {
          try {
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method as string);
            if (paymentMethod.card) {
              paymentMethodDetails.last4 = paymentMethod.card.last4;
              paymentMethodDetails.brand = paymentMethod.card.brand;
            }
          } catch (error) {
            console.error('Error retrieving payment method:', error);
          }
        }

        // Save successful payment to Firestore
        await addDoc(collection(db, 'amenity_payments'), {
          stripePaymentIntentId: paymentIntent.id,
          userEmail: paymentIntent.metadata.userEmail,
          amenity: paymentIntent.metadata.amenityName,
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency,
          paidAt: serverTimestamp(),
          status: 'paid',
          paymentMethod: paymentMethodDetails
        });
        
        console.log('Payment saved to Firestore:', paymentIntent.id);
      } catch (error) {
        console.error('Error saving payment to Firestore:', error);
      }
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', failedPayment.id);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 