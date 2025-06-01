'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { FaSpinner, FaFile, FaImage, FaFilePdf, FaFileWord, FaDownload, FaEye, FaUsers, FaGlobe, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: any;
  uploaderName: string;
  visibility: 'resident' | 'admin' | 'public';
}

export default function DocumentsPage() {
  const { user, userData } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisibility, setSelectedVisibility] = useState<'all' | 'resident' | 'public'>('all');
  const [retryCount, setRetryCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (user && userData) {
      // Use simple query instead of real-time listener to avoid 400 errors
      fallbackToSimpleQuery();
      // unsubscribe = setupRealtimeDocuments();
    } else if (user && !userData) {
      // User is authenticated but userData is not loaded yet, wait a bit
      const timer = setTimeout(() => {
        if (user && !userData && retryCount < 3) {
          setRetryCount(prev => prev + 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        console.log('Cleaning up real-time listener...');
        unsubscribe();
      }
    };
  }, [user, userData, retryCount]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedVisibility]);

  const setupRealtimeDocuments = () => {
    if (!user || !userData) {
      setError('Please log in to view documents');
      setLoading(false);
      return;
    }

    try {
      setError('');
      console.log('Setting up real-time documents for user:', userData);
      
      // Set up real-time listener for documents collection
      const documentsQuery = query(collection(db, 'documents'));
      
      const unsubscribe = onSnapshot(documentsQuery, 
        (snapshot) => {
          console.log('Real-time update received, documents count:', snapshot.docs.length);
          
          const allDocs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Document[];
          
          console.log('All documents from real-time update:', allDocs);
          
          // Filter documents based on user role and visibility
          let visibleDocs = allDocs;
          
          if (userData?.role !== 'admin') {
            // For non-admin users, only show resident and public documents
            visibleDocs = allDocs.filter(doc => 
              doc.visibility === 'resident' || doc.visibility === 'public'
            );
          }
          
          // Sort by upload date if available
          visibleDocs.sort((a, b) => {
            const dateA = a.uploadedAt?.toDate?.() || new Date(0);
            const dateB = b.uploadedAt?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
          
          console.log('Final visible documents:', visibleDocs);
          setDocuments(visibleDocs);
          setLoading(false);
          
          if (visibleDocs.length === 0) {
            setError('No documents found. Documents will appear here when they are uploaded.');
          } else {
            setError(''); // Clear any previous errors
          }
        },
        (error) => {
          console.error('Real-time listener error:', error);
          
          // Fallback to a simple query if real-time fails
          console.log('Falling back to simple query...');
          fallbackToSimpleQuery();
        }
      );
      
      // Return cleanup function
      return unsubscribe;
      
    } catch (error: any) {
      console.error('Error setting up real-time documents:', error);
      console.log('Falling back to simple query...');
      fallbackToSimpleQuery();
    }
  };

  const fallbackToSimpleQuery = async () => {
    try {
      console.log('Executing fallback simple query...');
      const documentsQuery = query(collection(db, 'documents'));
      const snapshot = await getDocs(documentsQuery);
      
      const allDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      
      // Filter documents based on user role and visibility
      let visibleDocs = allDocs;
      
      if (userData?.role !== 'admin') {
        visibleDocs = allDocs.filter(doc => 
          doc.visibility === 'resident' || doc.visibility === 'public'
        );
      }
      
      // Sort by upload date if available
      visibleDocs.sort((a, b) => {
        const dateA = a.uploadedAt?.toDate?.() || new Date(0);
        const dateB = b.uploadedAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('Fallback query successful, documents:', visibleDocs);
      setDocuments(visibleDocs);
      setLoading(false);
      
      if (visibleDocs.length === 0) {
        setError('No documents found. Documents will appear here when they are uploaded.');
      } else {
        setError('');
      }
      
    } catch (fallbackError: any) {
      console.error('Fallback query also failed:', fallbackError);
      
      // Provide more specific error messages
      if (fallbackError.code === 'permission-denied') {
        setError('Permission denied. This may be due to Firestore security rules. Please contact an administrator.');
      } else if (fallbackError.code === 'unavailable') {
        setError('Service is temporarily unavailable. Please try again later.');
      } else if (fallbackError.code === 'unauthenticated') {
        setError('Authentication expired. Please log out and log back in.');
      } else {
        setError(`Failed to load documents: ${fallbackError.message || 'Unknown error'}. Please try refreshing the page.`);
      }
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by visibility
    if (selectedVisibility !== 'all') {
      filtered = filtered.filter(doc => doc.visibility === selectedVisibility);
    }

    setFilteredDocuments(filtered);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FaFilePdf className="text-2xl" style={{ color: '#e53e3e' }} />;
    if (fileType.includes('word') || fileType.includes('document')) return <FaFileWord className="text-2xl" style={{ color: '#38A169' }} />;
    if (fileType.includes('image')) return <FaImage className="text-2xl" style={{ color: '#CBA135' }} />;
    return <FaFile className="text-2xl" style={{ color: '#CFCFCF' }} />;
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'resident': return <FaUsers style={{ color: '#38A169' }} />;
      case 'public': return <FaGlobe style={{ color: '#CBA135' }} />;
      default: return <FaUsers style={{ color: '#CFCFCF' }} />;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'resident': return 'Residents Only';
      case 'public': return 'Public Access';
      default: return 'Unknown';
    }
  };

  // Helper function to check if document is new (uploaded in last 24 hours)
  const isNewUpload = (uploadedAt: any) => {
    if (!uploadedAt?.toDate) return false;
    const uploadDate = uploadedAt.toDate();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return uploadDate > oneDayAgo;
  };

  // Separate documents into new uploads and older documents
  const separateDocuments = (docs: Document[]) => {
    const newUploads = docs.filter(doc => isNewUpload(doc.uploadedAt));
    const olderDocs = docs.filter(doc => !isNewUpload(doc.uploadedAt));
    return { newUploads, olderDocs };
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EDEDED' }}>
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl mx-auto mb-4" style={{ color: '#38A169' }} />
          <p style={{ color: '#1A1A1A' }}>Please log in to view documents</p>
        </div>
      </div>
    );
  }

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
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>Documents</h1>
            <button
              onClick={async () => {
                setRefreshing(true);
                await fallbackToSimpleQuery();
                setRefreshing(false);
              }}
              disabled={refreshing}
              className="px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
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
              {refreshing ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Refreshing...
                </span>
              ) : (
                <span className="flex items-center">
                  <FaDownload className="mr-2" />
                  Refresh Documents
                </span>
              )}
            </button>
          </div>
          <p style={{ color: '#1A1A1A' }}>Access important documents and resources</p>
          
          {/* Debug info for troubleshooting */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <p><strong>Debug:</strong> User: {user?.email}, Role: {userData?.role}, Documents: {documents.length}</p>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-6 p-4 rounded-lg shadow-lg" style={{ backgroundColor: '#F9F7F1' }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={{ 
                    borderColor: '#CFCFCF',
                    backgroundColor: '#F9F7F1',
                    color: '#1A1A1A'
                  }}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value as 'all' | 'resident' | 'public')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{ 
                  borderColor: '#CFCFCF',
                  backgroundColor: '#F9F7F1',
                  color: '#1A1A1A'
                }}
              >
                <option value="all">All Documents</option>
                <option value="resident">Residents Only</option>
                <option value="public">Public Access</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}>
            <div className="flex items-start">
              <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800 mb-1">Error Loading Documents</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={() => {
                    setLoading(true);
                    setError('');
                    fallbackToSimpleQuery();
                  }}
                  className="mt-3 px-3 py-1 text-sm font-medium rounded transition-colors"
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
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Grid */}
        {filteredDocuments.length === 0 && !loading && !error ? (
          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: '#F9F7F1' }}>
            <FaFile className="text-6xl mx-auto mb-4" style={{ color: '#CFCFCF' }} />
            <h3 className="text-xl font-medium mb-2" style={{ color: '#1A1A1A' }}>
              {searchTerm || selectedVisibility !== 'all' ? 'No matching documents' : 'No documents available'}
            </h3>
            <p style={{ color: '#CFCFCF' }}>
              {searchTerm || selectedVisibility !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Documents will appear here when they are uploaded'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 border"
                style={{ 
                  backgroundColor: '#F9F7F1',
                  borderColor: '#CFCFCF'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#CBA135';
                  e.currentTarget.style.backgroundColor = '#EDEDED';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#CFCFCF';
                  e.currentTarget.style.backgroundColor = '#F9F7F1';
                }}
              >
                {/* File Icon and Title */}
                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mr-3">
                    {getFileIcon(document.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium mb-1 truncate" style={{ color: '#1A1A1A' }}>
                      {document.title}
                    </h3>
                    <div className="flex items-center text-sm" style={{ color: '#CFCFCF' }}>
                      <div className="mr-2">
                        {getVisibilityIcon(document.visibility)}
                      </div>
                      <span>{getVisibilityLabel(document.visibility)}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {document.description && (
                  <p className="text-sm mb-4 line-clamp-3" style={{ color: '#1A1A1A' }}>
                    {document.description}
                  </p>
                )}

                {/* Document Info */}
                <div className="text-xs mb-4 space-y-1" style={{ color: '#CFCFCF' }}>
                  <div>Size: {formatFileSize(document.fileSize)}</div>
                  <div>
                    Uploaded: {document.uploadedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                  </div>
                  <div>By: {document.uploaderName}</div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(document.fileUrl, '_blank')}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    <FaEye className="mr-1" />
                    View
                  </button>
                  <a
                    href={document.fileUrl}
                    download
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded transition-colors border focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    style={{ 
                      borderColor: '#CFCFCF',
                      backgroundColor: '#F9F7F1',
                      color: '#1A1A1A'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#EDEDED';
                      e.currentTarget.style.borderColor = '#CBA135';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9F7F1';
                      e.currentTarget.style.borderColor = '#CFCFCF';
                    }}
                  >
                    <FaDownload className="mr-1" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {filteredDocuments.length > 0 && (
          <div className="mt-8 text-center text-sm" style={{ color: '#CFCFCF' }}>
            Showing {filteredDocuments.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
