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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">
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
        uploaderName: userData.name || user.email,
        visibility
      };
      
      console.log('Document data:', docData);
      await addDoc(collection(db, 'documents'), docData);
      console.log('Document metadata saved successfully');
      console.log('=== UPLOAD DEBUG END ===');
      
      setUploadProgress(100);
      setSuccess('Document uploaded successfully!');
      
      // Reset form
      setTimeout(() => {
        setFile(null);
        setTitle('');
        setDescription('');
        setVisibility('resident');
        setUploadProgress(0);
        setSuccess('');
        
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }, 2000);
      
    } catch (error: any) {
      console.error('=== UPLOAD ERROR ===');
      console.error('Upload error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to upload document. Please try again.';
      
      // Provide more specific error messages
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'You do not have permission to upload files. Please contact an administrator.';
      } else if (error.code === 'storage/canceled') {
        errorMessage = 'Upload was canceled.';
      } else if (error.code === 'storage/unknown') {
        errorMessage = 'An unknown error occurred. Please check your internet connection and try again.';
      } else if (error.code === 'storage/invalid-format') {
        errorMessage = 'Invalid file format. Please upload a PDF, Word document, or image.';
      } else if (error.code === 'storage/invalid-argument') {
        errorMessage = 'Invalid file. Please select a valid file and try again.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your admin privileges.';
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorMessage = 'Upload failed after multiple retries. This may be due to network issues or Firebase Storage configuration. Please try again later.';
      } else if (error.message) {
        errorMessage = `Upload failed: ${error.message}`;
      }
      
      setError(errorMessage);
      setUploadProgress(0);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Back to Documents
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Upload Document</h1>
          <p className="text-gray-600 mt-2">Upload documents for residents and admins to access</p>
        </div>

        {/* Debug Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">Debug Information:</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>User Email:</strong> {user?.email || 'Not available'}</p>
            <p><strong>User UID:</strong> {user?.uid || 'Not available'}</p>
            <p><strong>User Data Role:</strong> {userData?.role || 'Not available'}</p>
            <p><strong>User Name:</strong> {userData?.name || 'Not available'}</p>
            <p><strong>Is Admin Check:</strong> {isAdmin ? 'TRUE' : 'FALSE'}</p>
            <p><strong>Raw User Data:</strong> {JSON.stringify(userData, null, 2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FaUpload className="text-4xl text-gray-400 mb-4" />
                  <span className="text-lg font-medium text-gray-700">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    PDF, Word documents, or images (max 10MB)
                  </span>
                </label>
              </div>
              
              {file && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <FaFile className="text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        const fileInput = document.getElementById('file-input') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter document title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter document description (optional)"
              />
            </div>

            {/* Visibility */}
            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'resident' | 'admin' | 'public')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="resident">Residents Only</option>
                <option value="admin">Admins Only</option>
                <option value="public">Public Access</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {visibility === 'resident' && 'Only logged-in residents can view this document'}
                {visibility === 'admin' && 'Only admins can view this document'}
                {visibility === 'public' && 'Anyone can view this document'}
              </p>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <FaSpinner className="animate-spin text-blue-600" />
                  <span className="font-medium text-blue-900">Uploading...</span>
                  <span className="text-blue-700">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <FaCheck className="text-green-600" />
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || !title.trim() || uploading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload />
                  Upload Document
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 