import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { unit, apartment, userName, userEmail, date, time, duration } = body;

    // Validate required fields
    if (!unit || !date || !time || !duration || !userName || !userEmail) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'All fields are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Simulate availability check
    const available = time !== '12:00';

    if (!available) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Lift not available at this time.' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Store booking in Firestore
    await addDoc(collection(db, 'lift_bookings'), {
      unit,
      apartment: apartment || '',
      userName,
      userEmail,
      date,
      time,
      duration,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    // Simulate successful booking
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lift booked successfully! Your request is being processed.',
        bookingDetails: {
          unit,
          apartment,
          userName,
          userEmail,
          date,
          time,
          duration,
          status: 'pending',
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'An error occurred while processing your request.' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 