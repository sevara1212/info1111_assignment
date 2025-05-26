import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    // Basic validation
    if (!email || !password || !name || !role) {
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }
    if (!['admin', 'resident'].includes(role)) {
      return NextResponse.json({ success: false, message: 'Invalid role.' }, { status: 400 });
    }

    // Create user in Firebase Auth
    const auth = getAuth();
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    // Save user data in Firestore (only allowed fields)
    const userData = {
      name,
      email,
      role,
    };
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Signup failed.' }, { status: 500 });
  }
} 