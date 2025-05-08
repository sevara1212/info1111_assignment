import { NextResponse } from 'next/server';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const { email, password, name, apartment, floor } = await request.json();

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      apartment: parseInt(apartment),
      floor: parseInt(floor),
      role: 'resident',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully' 
    });
  } catch (error: any) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error creating user' 
      },
      { status: 400 }
    );
  }
} 