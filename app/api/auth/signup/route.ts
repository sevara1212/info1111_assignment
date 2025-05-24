import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';

export async function POST(request: Request) {
  try {
    const { email, password, name, apartment, floor, role, adminRole } = await request.json();

    // Basic validation
    if (!email || !password || !name || (role === 'resident' && (!apartment || !floor))) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }
    if (role === 'admin' && !adminRole) {
      return NextResponse.json({ success: false, message: 'Missing admin role.' }, { status: 400 });
    }

    // Check if user already exists in Firestore
    const userDocRef = doc(db, 'users', email);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return NextResponse.json({ success: false, message: 'User already exists.' }, { status: 409 });
    }

    // Create user in Firebase Auth
    const auth = getAuth();
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    // Save user data in Firestore
    const userData: any = {
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    };
    if (role === 'resident') {
      userData.apartment = apartment;
      userData.floor = floor;
    } else if (role === 'admin') {
      userData.adminRole = adminRole;
    }
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Signup failed.' }, { status: 500 });
  }
} 