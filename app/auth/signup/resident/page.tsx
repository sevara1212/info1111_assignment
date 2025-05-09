"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";

export default function ResidentSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unit, setUnit] = useState("");
  const [floor, setFloor] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        unit,
        floor,
        role: "resident",
        createdAt: new Date().toISOString(),
      });
      // Set cookies for middleware
      document.cookie = `auth=${user.uid}; path=/`;
      document.cookie = `userRole=resident; path=/`;
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Email is already in use");
          break;
        case "auth/invalid-email":
          setError("Invalid email address");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters");
          break;
        default:
          setError(err.message || "Failed to create account");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h2 className="text-2xl font-bold mb-4">Create Resident Account</h2>
      <form onSubmit={handleSignup} className="space-y-4 w-full max-w-sm">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
          disabled={isLoading}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
          minLength={6}
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Unit (e.g. 12B)"
          value={unit}
          onChange={e => setUnit(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Floor (e.g. 5)"
          value={floor}
          onChange={e => setFloor(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
          disabled={isLoading}
        />
        <button
          className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Account"}
        </button>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}
      </form>
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/resident" className="text-blue-600 hover:text-blue-800 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
} 