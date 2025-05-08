import { NextResponse } from 'next/server';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Function to calculate entitlements based on apartment size and floor
const calculateEntitlements = (apartment: number, floor: number): number => {
  // Base entitlement
  let entitlements = 1;
  
  // Higher floors get more entitlements
  if (floor > 10) entitlements += 0.5;
  if (floor > 20) entitlements += 0.5;
  
  // Larger apartments get more entitlements
  if (apartment > 100) entitlements += 0.5;
  if (apartment > 200) entitlements += 0.5;
  
  return entitlements;
};

// Function to check if this is the first user (to make them admin)
const isFirstUser = async (): Promise<boolean> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef);
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
};

export async function POST(request: Request) {
  try {
    const { email, password, name, apartment, floor } = await request.json();

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if this is the first user
    const isAdmin = await isFirstUser();
    
    // Calculate entitlements
    const entitlements = calculateEntitlements(parseInt(apartment), parseInt(floor));

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      apartment: parseInt(apartment),
      floor: parseInt(floor),
      role: isAdmin ? 'admin' : 'resident',
      entitlements,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // If this is the first user (admin), create initial levy
    if (isAdmin) {
      const currentDate = new Date();
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      
      await setDoc(doc(db, 'levies', `initial-${user.uid}`), {
        amount: 1000, // Initial levy amount
        description: 'Initial Administrative Levy',
        dueDate: nextMonth,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      isAdmin
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