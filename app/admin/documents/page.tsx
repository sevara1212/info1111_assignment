'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { FaUpload, FaEye, FaTrash, FaSpinner, FaFile, FaImage, FaFilePdf, FaFileWord, FaUsers, FaUserShield, FaGlobe } from 'react-icons/fa';
import Link from 'next/link';

interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: any;
  uploadedBy: string;
  uploaderName: string;
  visibility: 'resident' | 'admin' | 'public';
}

export default function AdminDocumentsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setError('');
      console.log('Admin fetching documents...');
      
      // Try with ordering first, fall back to unordered if index doesn't exist
      let q;
      try {
        q = query(collection(db, 'documents'), orderBy('uploadedAt', 'desc'));
      } catch (indexError) {
        console.log('Using unordered query due to missing index');
        q = query(collection(db, 'documents'));
      }
      
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      
      // Sort manually if we couldn't use orderBy
      docs.sort((a, b) => {
        const dateA = a.uploadedAt?.toDate?.() || new Date(0);
        const dateB = b.uploadedAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('Admin fetched documents:', docs);
      setDocuments(docs);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please check your admin privileges.');
      } else if (error.code === 'unavailable') {
        setError('Service is temporarily unavailable. Please try again later.');
      } else if (error.code === 'failed-precondition') {
        setError('Database index is being built. Please try again in a few minutes.');
      } else {
        setError(`Failed to load documents: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (document: Document) => {
    if (!confirm(`Are you sure you want to delete "${document.title}"?`)) {
      return;
    }

    setDeleting(document.id);
    try {
      // Delete file from Firebase Storage
      const fileRef = ref(storage, `documents/${document.fileName}`);
      await deleteObject(fileRef);

      // Delete document metadata from Firestore
      await deleteDoc(doc(db, 'documents', document.id));

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== document.id));
    } catch (error: any) {
      console.error('Error deleting document:', error);
      if (error.code === 'object-not-found') {
        // File doesn't exist in storage, just delete from Firestore
        try {
          await deleteDoc(doc(db, 'documents', document.id));
          setDocuments(prev => prev.filter(doc => doc.id !== document.id));
        } catch (firestoreError) {
          setError('Failed to delete document from database');
        }
      } else {
        setError('Failed to delete document');
      }
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FaFilePdf style={{ color: '#e53e3e' }} />;
    if (fileType.includes('word') || fileType.includes('document')) return <FaFileWord style={{ color: '#38A169' }} />;
    if (fileType.includes('image')) return <FaImage style={{ color: '#CBA135' }} />;
    return <FaFile style={{ color: '#CFCFCF' }} />;
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'admin': return <FaUserShield style={{ color: '#e53e3e' }} />;
      case 'resident': return <FaUsers style={{ color: '#38A169' }} />;
      case 'public': return <FaGlobe style={{ color: '#CBA135' }} />;
      default: return <FaUsers style={{ color: '#CFCFCF' }} />;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'admin': return 'Admins Only';
      case 'resident': return 'Residents';
      case 'public': return 'Public';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EDEDED' }}>
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl mx-auto mb-4" style={{ color: '#38A169' }} />
          <p style={{ color: '#1A1A1A' }}>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#EDEDED' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>Document Management</h1>
            <p className="mt-2" style={{ color: '#1A1A1A' }}>Manage documents for residents and admins</p>
          </div>
          <Link
            href="/admin/documents/upload"
            className="inline-flex items-center px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
            style={{ 
              backgroundColor: '#38A169',
              color: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#CBA135';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#38A169';
            }}
          >
            <FaUpload className="mr-2" />
            Upload Document
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', border: '1px solid' }}>
            <p style={{ color: '#ef4444' }}>{error}</p>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: '#F9F7F1' }}>
            <FaFile className="text-6xl mx-auto mb-4" style={{ color: '#CFCFCF' }} />
            <h3 className="text-xl font-medium mb-2" style={{ color: '#1A1A1A' }}>No documents uploaded</h3>
            <p className="mb-6" style={{ color: '#CFCFCF' }}>Upload your first document to get started</p>
            <Link
              href="/admin/documents/upload"
              className="inline-flex items-center px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
              style={{ 
                backgroundColor: '#38A169',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#CBA135';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#38A169';
              }}
            >
              <FaUpload className="mr-2" />
              Upload Document
            </Link>
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden shadow-lg" style={{ backgroundColor: '#F9F7F1' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#CFCFCF' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1A1A1A' }}>
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1A1A1A' }}>
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1A1A1A' }}>
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1A1A1A' }}>
                      Size
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: '#1A1A1A' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {documents.map((document, index) => (
                    <tr 
                      key={document.id} 
                      className="hover:bg-opacity-50"
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#F9F7F1' : '#EDEDED'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(203, 161, 53, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#F9F7F1' : '#EDEDED';
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {getFileIcon(document.fileType)}
                          </div>
                          <div>
                            <div className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                              {document.title}
                            </div>
                            {document.description && (
                              <div className="text-sm" style={{ color: '#CFCFCF' }}>
                                {document.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="mr-2">
                            {getVisibilityIcon(document.visibility)}
                          </div>
                          <span className="text-sm" style={{ color: '#1A1A1A' }}>
                            {getVisibilityLabel(document.visibility)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#1A1A1A' }}>
                        <div>
                          {document.uploadedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                        </div>
                        <div className="text-xs" style={{ color: '#CFCFCF' }}>
                          by {document.uploaderName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: '#1A1A1A' }}>
                        {formatFileSize(document.fileSize)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => window.open(document.fileUrl, '_blank')}
                            className="p-2 rounded-md hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                            style={{ 
                              backgroundColor: 'rgba(56, 161, 105, 0.1)',
                              color: '#38A169'
                            }}
                            title="View Document"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(56, 161, 105, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(56, 161, 105, 0.1)';
                            }}
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDelete(document)}
                            disabled={deleting === document.id}
                            className="p-2 rounded-md hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                            style={{ 
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444'
                            }}
                            title="Delete Document"
                            onMouseEnter={(e) => {
                              if (!e.currentTarget.disabled) {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!e.currentTarget.disabled) {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              }
                            }}
                          >
                            {deleting === document.id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaTrash />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 