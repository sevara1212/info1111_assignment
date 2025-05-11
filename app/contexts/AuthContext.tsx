'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, apartment: string, floor: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
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
            const role = userDoc.data().role;
            console.log('User role:', role);
            setUserRole(role);
            
            // Set cookies for middleware
            Cookies.set('auth', 'true', { expires: 7 });
            Cookies.set('userRole', role, { expires: 7 });
            
            // Redirect based on role
            if (role === 'admin') {
              console.log('Redirecting to admin dashboard');
              router.push('/admin');
            } else {
              console.log('Redirecting to resident dashboard');
              router.push('/dashboard');
            }
          } else {
            console.error('User document not found in Firestore');
            setUserRole(null);
            Cookies.remove('auth');
            Cookies.remove('userRole');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserRole(null);
          Cookies.remove('auth');
          Cookies.remove('userRole');
        }
      } else {
        console.log('No user logged in');
        setUserRole(null);
        Cookies.remove('auth');
        Cookies.remove('userRole');
      }
      
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider unmounting');
      unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase auth successful:', userCredential.user.uid);
      
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      console.log('Firestore document exists:', userDoc.exists());
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }
      
      const role = userDoc.data().role;
      console.log('User role:', role);
      setUserRole(role);
      
      // Set cookies for middleware
      Cookies.set('auth', 'true', { expires: 7 });
      Cookies.set('userRole', role, { expires: 7 });
      
      // Redirect based on role
      if (role === 'admin') {
        console.log('Redirecting to admin dashboard');
        router.push('/admin');
      } else {
        console.log('Redirecting to resident dashboard');
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUp = async (email: string, password: string, name: string, apartment: string, floor: string) => {
    console.log('Attempting sign up for:', email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase auth successful:', userCredential.user.uid);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        name,
        apartment,
        floor,
        role: 'resident', // Default role for new users
        createdAt: new Date().toISOString()
      });
      console.log('Firestore document created');
      
      setUserRole('resident');
      
      // Set cookies for middleware
      Cookies.set('auth', 'true', { expires: 7 });
      Cookies.set('userRole', 'resident', { expires: 7 });
      
      console.log('Redirecting to dashboard');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const logout = async () => {
    console.log('Attempting logout');
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
      Cookies.remove('auth');
      Cookies.remove('userRole');
      console.log('Redirecting to home');
      router.push('/');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to log out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 