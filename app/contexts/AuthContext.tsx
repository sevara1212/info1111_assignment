'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface UserData {
  name: string;
  email: string;
  role: 'resident' | 'admin';
  apartment?: string;
  unit?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'resident' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (name: string, email: string, apartment?: string, unitNumber?: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('AuthProvider mounted');
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      console.log('Auth state changed:', currentUser?.email);
      setUser(currentUser);
      
      if (currentUser) {
        try {
          console.log('Fetching user data for:', currentUser.uid);
          // Fetch user role from Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setUserRole(data.role);
          } else {
            setUserData(null);
            setUserRole(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
          setUserRole(null);
        }
      } else {
        console.log('No user logged in');
        setUserData(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider unmounting');
      unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role);
        setUserData(userData);
        Cookies.set('auth', 'true');
        Cookies.set('userRole', userData.role);
        if (userData.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (userData.role === 'resident') {
          window.location.href = '/dashboard';
        } else {
          throw new Error('Invalid user role');
        }
      } else {
        setUserData(null);
        setUserRole(null);
        throw new Error('User data not found');
      }
    } catch (error) {
      setUserData(null);
      setUserRole(null);
      Cookies.remove('auth');
      Cookies.remove('userRole');
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'resident' | 'admin') => {
    console.log('Attempting sign up for:', email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase auth successful:', userCredential.user.uid);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        name,
        role,
        createdAt: new Date().toISOString()
      });
      console.log('Firestore document created');
      
      setUserRole(role);
      
      // Set cookies for middleware
      Cookies.set('auth', 'true', { expires: 7 });
      Cookies.set('userRole', role, { expires: 7 });
      
      console.log('Redirecting to dashboard');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setUserData(null);
      setUserRole(null);
      Cookies.remove('auth');
      Cookies.remove('userRole');
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (name: string, email: string, apartment?: string, unitNumber?: string) => {
    if (!user) throw new Error('No user');
    const updateData: any = {};
    if (name) {
      await fbUpdateProfile(user, { displayName: name });
      updateData.name = name;
    }
    if (email && email !== user.email) {
      await updateEmail(user, email);
      updateData.email = email;
    }
    if (apartment) {
      updateData.apartment = apartment;
    }
    if (unitNumber) {
      updateData.unit = unitNumber;
    }
    if (Object.keys(updateData).length > 0) {
      await setDoc(doc(db, 'users', user.uid), updateData, { merge: true });
      setUserData((prev: any) => ({ ...prev, ...updateData }));
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error('No user');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signIn, signUp, signOut, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 