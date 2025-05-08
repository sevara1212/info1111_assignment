'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const validateApartment = (floor: number, apt: number): boolean => {
    const min = floor * 100 + 1;
    const max = floor * 100 + 50;
    return apt >= min && apt <= max;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const floorNum = parseInt(floor);
    const aptNum = parseInt(apartment);
    if (!validateApartment(floorNum, aptNum)) {
      setError(`Apartment ${aptNum} is not valid for floor ${floorNum}.`);
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCred.user.uid), {
        name,
        email,
        floor: floorNum,
        apartment: aptNum,
      });
      router.push('/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">User Registration</h2>
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="border px-3 py-2" />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="border px-3 py-2" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="border px-3 py-2" />
        <input type="number" placeholder="Floor" value={floor} onChange={e => setFloor(e.target.value)} required className="border px-3 py-2" />
        <input type="number" placeholder="Apartment Number" value={apartment} onChange={e => setApartment(e.target.value)} required className="border px-3 py-2" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Sign Up</button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}
