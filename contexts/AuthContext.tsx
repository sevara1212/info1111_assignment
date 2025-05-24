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
<<<<<<< HEAD
        setUserRole(userData.role);
        setUserData(userData);
        if (userData.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        setUserData(null);
        setUserRole(null);
=======
        
        if (userData.role === 'admin') {
          if (!userData.adminRole || !ADMIN_ROLES.includes(userData.adminRole)) {
            throw new Error('Invalid admin role');
          }
          window.location.href = '/admin/dashboard';
        } else if (userData.role === 'resident') {
          window.location.href = '/dashboard';
        } else {
          throw new Error('Invalid user role');
        }
      } else {
>>>>>>> af1f703 (s)
        throw new Error('User data not found');
      }
    } catch (error) {
      setUserData(null);
      setUserRole(null);
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
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
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
<<<<<<< HEAD
    <AuthContext.Provider value={{ user, userRole, userData, loading, isAdmin, signIn, signUp, signOut, resetPassword }}>
=======
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, signIn, signUp, signOut, resetPassword, checkAuth }}>
>>>>>>> af1f703 (s)
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 