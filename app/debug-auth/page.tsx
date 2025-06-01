'use client';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { useState } from 'react';

export default function DebugAuthPage() {
  const { user, userData } = useAuth();
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testFirestoreRead = async () => {
    setLoading(true);
    try {
      console.log('Testing Firestore read...');
      console.log('User:', user);
      console.log('UserData:', userData);
      
      const documentsRef = collection(db, 'documents');
      const snapshot = await getDocs(documentsRef);
      
      setTestResult(`✅ Success! Found ${snapshot.size} documents. User: ${user?.email}, Role: ${userData?.role}`);
    } catch (error: any) {
      console.error('Firestore read error:', error);
      setTestResult(`❌ Error: ${error.code} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testFirestoreWrite = async () => {
    setLoading(true);
    try {
      console.log('Testing Firestore write...');
      
      const testDoc = {
        title: "Test Document",
        description: "Test description",
        fileUrl: "/test.pdf",
        fileName: "test.pdf",
        fileSize: 1024,
        fileType: "application/pdf",
        uploadedAt: new Date(),
        uploaderName: userData?.name || "Test User",
        visibility: "public"
      };
      
      const docRef = await addDoc(collection(db, 'documents'), testDoc);
      setTestResult(`✅ Write Success! Document ID: ${docRef.id}`);
    } catch (error: any) {
      console.error('Firestore write error:', error);
      setTestResult(`❌ Write Error: ${error.code} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiEndpoint = async () => {
    setLoading(true);
    try {
      console.log('Testing API endpoint...');
      
      const response = await fetch('/api/test-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestResult(`✅ API Success! Document ID: ${data.documentId}`);
      } else {
        setTestResult(`❌ API Error: ${data.error} (${data.code})`);
      }
    } catch (error: any) {
      console.error('API endpoint error:', error);
      setTestResult(`❌ API Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Authentication</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">Authentication State</h2>
          <div className="space-y-2">
            <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
            <p><strong>UID:</strong> {user?.uid || 'N/A'}</p>
            <p><strong>User Data:</strong> {userData ? JSON.stringify(userData, null, 2) : 'No user data'}</p>
            <p><strong>Role:</strong> {userData?.role || 'No role'}</p>
            <p><strong>Is Admin:</strong> {userData?.role === 'admin' ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-4">Firestore Tests</h2>
          
          <div className="space-y-4">
            <button
              onClick={testFirestoreRead}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Firestore Read'}
            </button>
            
            <button
              onClick={testFirestoreWrite}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 ml-4"
            >
              {loading ? 'Testing...' : 'Test Firestore Write'}
            </button>

            <button
              onClick={testApiEndpoint}
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 ml-4"
            >
              {loading ? 'Testing...' : 'Test API Endpoint'}
            </button>
          </div>
          
          {testResult && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-bold mb-2">Test Result:</h3>
              <pre className="whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 