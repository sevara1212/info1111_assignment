'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';

const ADMIN_ROLES = [
  'Security',
  'Strata Management',
  'Building Management',
  'Chairperson',
  'Treasurer',
  'Secretary'
];

interface UserData {
  id: string;
  name: string;
  email: string;
  apartment: number;
  floor: number;
  role: string;
  adminRole?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  userData: any | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, apartment: string, floor: string, adminRole?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkAuth: (requiredRole?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const fetchUserData = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserRole(data.role);
        setUserData(data);
        setIsAdmin(data.role === 'admin');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
        setUserRole(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role);
        setUserData(userData);
        // Set cookies for middleware
        Cookies.set('auth', 'true');
        Cookies.set('userRole', userData.role);
        
        if (userData.role === 'admin') {
          // Redirect to admin dashboard after userData is set
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

  const signUp = async (email: string, password: string, name: string, apartment: string, floor: string, adminRole?: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          apartment,
          floor,
          role: adminRole ? 'admin' : 'resident',
          adminRole
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error creating account');
      }

      if (adminRole) {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };

  const checkAuth = async (requiredRole?: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return false;
      
      const userData = userDoc.data();
      if (requiredRole && userData.role !== requiredRole) return false;
      
      return true;
    } catch (error) {
      console.error('Error checking auth:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, userData, loading, isAdmin, signIn, signUp, signOut, resetPassword, checkAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 