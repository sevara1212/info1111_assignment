'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FaUpload, FaSpinner, FaFile, FaCheck, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function AdminDocumentUploadPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'resident' | 'admin' | 'public'>('resident');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Show loading while auth is still loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EDEDED' }}>
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl mx-auto mb-4" style={{ color: '#38A169' }} />
          <p style={{ color: '#1A1A1A' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin - only check after auth is loaded
  const isAdmin = user && userData && (
    userData.role === 'admin' || 
    user.email?.includes('admin') || 
    user.email?.endsWith('@sevara.apartments')
  );

  if (!user || !userData || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EDEDED' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#e53e3e' }}>Access Denied</h1>
          <p style={{ color: '#1A1A1A' }}>You need admin privileges to access this page.</p>
          <p className="text-sm mt-2" style={{ color: '#CFCFCF' }}>
            Current user: {user?.email || 'Not logged in'} | Role: {userData?.role || 'No role'}
          </p>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only PDF, Word documents, and images are allowed');
        return;
      }
      
      setFile(selectedFile);
      setError('');
      
      // Auto-generate title from filename if not set
      if (!title) {
        const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(nameWithoutExtension);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title.trim()) {
      setError('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      console.log('=== UPLOAD DEBUG START ===');
      console.log('Starting upload process...');
      console.log('User:', user?.email);
      console.log('User authenticated:', !!user);
      console.log('File:', file.name, file.size, file.type);

      // Test Firebase Auth
      if (user) {
        try {
          const token = await user.getIdToken();
          console.log('Auth token exists:', !!token);
          console.log('Token length:', token.length);
        } catch (tokenError) {
          console.error('Failed to get auth token:', tokenError);
        }
      }

      // Create a unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${title.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;
      
      console.log('Generated filename:', fileName);

      // Test storage reference creation
      console.log('Creating storage reference...');
      const fileRef = ref(storage, `documents/${fileName}`);
      console.log('Storage reference created:', fileRef.fullPath);
      console.log('Storage bucket:', fileRef.bucket);
      
      // Test uploadBytesResumable creation
      console.log('Creating upload task...');
      const uploadTask = uploadBytesResumable(fileRef, file);
      console.log('Upload task created successfully');
      console.log('Upload task state:', uploadTask.snapshot.state);
      
      // Add timeout to catch if upload never starts
      const uploadTimeout = setTimeout(() => {
        console.error('Upload timeout - task never started progress');
        uploadTask.cancel();
        setError('Upload timed out. Please check your internet connection and try again.');
        setUploading(false);
        setUploadProgress(0);
      }, 30000); // 30 second timeout
      
      // Monitor upload progress
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Calculate and update progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 90;
            console.log(`Upload progress: ${progress}% (${snapshot.bytesTransferred}/${snapshot.totalBytes})`);
            console.log('Upload state:', snapshot.state);
            setUploadProgress(Math.round(progress));
            
            // Clear timeout if progress is happening
            if (snapshot.bytesTransferred > 0) {
              clearTimeout(uploadTimeout);
            }
          },
          (error) => {
            clearTimeout(uploadTimeout);
            console.error('Upload error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error object:', error);
            reject(error);
          },
          () => {
            clearTimeout(uploadTimeout);
            console.log('Upload completed successfully');
            resolve(uploadTask.snapshot);
          }
        );
        
        // Log initial state
        console.log('Upload listener attached, initial state:', uploadTask.snapshot.state);
      });
      
      setUploadProgress(95);
      console.log('Getting download URL...');
      
      // Get download URL
      const fileUrl = await getDownloadURL(fileRef);
      console.log('Download URL obtained:', fileUrl);
      setUploadProgress(98);
      
      console.log('Saving metadata to Firestore...');
      // Save document metadata to Firestore
      const docData = {
        title: title.trim(),
        description: description.trim(),
        fileUrl,
        fileName,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: serverTimestamp(),
        uploadedBy: user.uid,
        uploaderName: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}`
          : userData.displayName || user.email || 'Unknown User',
        visibility
      };
      
      console.log('Document data to save:', docData);
      const docRef = await addDoc(collection(db, 'documents'), docData);
      console.log('Document saved with ID:', docRef.id);
      
      setUploadProgress(100);
      setSuccess('Document uploaded successfully!');
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setVisibility('resident');
      setUploadProgress(0);
      
      // Optional: redirect after a delay
      setTimeout(() => {
        router.push('/admin/documents');
      }, 2000);
      
      console.log('=== UPLOAD DEBUG SUCCESS ===');
      
    } catch (error: any) {
      console.error('=== UPLOAD DEBUG ERROR ===');
      console.error('Upload failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      
      if (error.code === 'storage/unauthorized') {
        setError('Storage access denied. Please check your authentication and permissions.');
      } else if (error.code === 'storage/canceled') {
        setError('Upload was canceled.');
      } else if (error.code === 'storage/unknown') {
        setError('An unknown error occurred during upload.');
      } else if (error.code === 'permission-denied') {
        setError('Permission denied. You may not have the required permissions to upload documents.');
      } else if (error.code === 'unavailable') {
        setError('Service is temporarily unavailable. Please try again later.');
      } else {
        setError(`Upload failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#EDEDED' }}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Upload Document</h1>
          <p style={{ color: '#1A1A1A' }}>Upload documents for residents and admins to access</p>
        </div>

        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F9F7F1', borderColor: '#CFCFCF' }}>
          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Select File
              </label>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  file ? 'border-green-300 bg-green-50' : 'hover:border-green-300'
                }`}
                style={{ 
                  borderColor: file ? '#38A169' : '#CFCFCF',
                  backgroundColor: file ? 'rgba(56, 161, 105, 0.1)' : 'transparent'
                }}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div>
                      <FaCheck className="text-4xl mx-auto mb-4" style={{ color: '#38A169' }} />
                      <p className="text-lg font-medium" style={{ color: '#1A1A1A' }}>{file.name}</p>
                      <p className="text-sm" style={{ color: '#CFCFCF' }}>
                        {formatFileSize(file.size)} • Click to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <FaUpload className="text-4xl mx-auto mb-4" style={{ color: '#CFCFCF' }} />
                      <p className="text-lg font-medium" style={{ color: '#1A1A1A' }}>
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm" style={{ color: '#CFCFCF' }}>
                        PDF, Word documents, or images (max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Document Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{ 
                  borderColor: '#CFCFCF',
                  backgroundColor: '#F9F7F1',
                  color: '#1A1A1A'
                }}
                required
                disabled={uploading}
              />
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter document description"
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{ 
                  borderColor: '#CFCFCF',
                  backgroundColor: '#F9F7F1',
                  color: '#1A1A1A'
                }}
                disabled={uploading}
              />
            </div>

            {/* Visibility Selection */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'resident' | 'admin' | 'public')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{ 
                  borderColor: '#CFCFCF',
                  backgroundColor: '#F9F7F1',
                  color: '#1A1A1A'
                }}
                disabled={uploading}
              >
                <option value="resident">Residents Only</option>
                <option value="admin">Admins Only</option>
                <option value="public">Public Access</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-md" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', border: '1px solid' }}>
                <div className="flex">
                  <FaTimes className="text-red-500 mt-0.5 mr-2" />
                  <p style={{ color: '#ef4444' }}>{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 rounded-md" style={{ backgroundColor: 'rgba(56, 161, 105, 0.1)', borderColor: '#38A169', border: '1px solid' }}>
                <div className="flex">
                  <FaCheck className="mt-0.5 mr-2" style={{ color: '#38A169' }} />
                  <p style={{ color: '#38A169' }}>{success}</p>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>Uploading...</span>
                  <span className="text-sm" style={{ color: '#1A1A1A' }}>{uploadProgress}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: '#CFCFCF' }}>
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: '#38A169',
                      width: `${uploadProgress}%`
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!file || !title.trim() || uploading}
                className="flex-1 py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ 
                  backgroundColor: '#38A169',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#CBA135';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#38A169';
                  }
                }}
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <FaUpload className="mr-2" />
                    Upload Document
                  </span>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/admin/documents')}
                disabled={uploading}
                className="px-6 py-2 border rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ 
                  borderColor: '#CFCFCF',
                  backgroundColor: '#F9F7F1',
                  color: '#1A1A1A'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#EDEDED';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#F9F7F1';
                  }
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 