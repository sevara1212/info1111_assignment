'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
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

  useEffect(() => {
    if (user && userData) {
      fetchDocuments();
    } else if (user && !userData) {
      // User is authenticated but userData is not loaded yet, wait a bit
      const timer = setTimeout(() => {
        if (user && !userData && retryCount < 3) {
          setRetryCount(prev => prev + 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, userData, retryCount]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedVisibility]);

  const fetchDocuments = async () => {
    if (!user || !userData) {
      setError('Please log in to view documents');
      setLoading(false);
      return;
    }

    try {
      setError('');
      console.log('Fetching documents for user:', userData);
      
      // Try multiple approaches to get documents
      let allDocs: Document[] = [];
      
      // Approach 1: Try to get all documents without ordering
      try {
        console.log('Trying basic query...');
        const basicQuery = query(collection(db, 'documents'));
        const snapshot = await getDocs(basicQuery);
        allDocs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Document[];
        console.log('Basic query successful, found:', allDocs.length, 'documents');
      } catch (basicError: any) {
        console.error('Basic query failed:', basicError);
        
        // Approach 2: Try with specific visibility filters
        try {
          console.log('Trying visibility-based queries...');
          const publicQuery = query(collection(db, 'documents'), where('visibility', '==', 'public'));
          const publicSnapshot = await getDocs(publicQuery);
          
          const residentQuery = query(collection(db, 'documents'), where('visibility', '==', 'resident'));
          const residentSnapshot = await getDocs(residentQuery);
          
          allDocs = [
            ...publicSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            ...residentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          ] as Document[];
          
          // If user is admin, also get admin documents
          if (userData.role === 'admin') {
            const adminQuery = query(collection(db, 'documents'), where('visibility', '==', 'admin'));
            const adminSnapshot = await getDocs(adminQuery);
            allDocs.push(...adminSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Document[]);
          }
          
          console.log('Visibility-based queries successful, found:', allDocs.length, 'documents');
        } catch (visibilityError: any) {
          console.error('Visibility-based queries failed:', visibilityError);
          throw visibilityError;
        }
      }
      
      // Filter documents based on user role and visibility (client-side filtering as backup)
      let visibleDocs = allDocs;
      
      if (userData?.role !== 'admin') {
        // For non-admin users, only show resident and public documents
        visibleDocs = allDocs.filter(doc => 
          doc.visibility === 'resident' || doc.visibility === 'public'
        );
      }
      
      // Remove duplicates (in case we got the same document from multiple queries)
      const uniqueDocs = visibleDocs.filter((doc, index, self) => 
        index === self.findIndex(d => d.id === doc.id)
      );
      
      // Sort by upload date if available
      uniqueDocs.sort((a, b) => {
        const dateA = a.uploadedAt?.toDate?.() || new Date(0);
        const dateB = b.uploadedAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('Final visible documents:', uniqueDocs);
      setDocuments(uniqueDocs);
      
      if (uniqueDocs.length === 0) {
        setError('No documents found. Documents may not have been uploaded yet, or you may not have permission to view them.');
      }
      
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        setError('Permission denied. This may be due to Firestore security rules. Please contact an administrator.');
      } else if (error.code === 'unavailable') {
        setError('Service is temporarily unavailable. Please try again later.');
      } else if (error.code === 'failed-precondition') {
        setError('Database index is being built. Please try again in a few minutes.');
      } else if (error.code === 'unauthenticated') {
        setError('Authentication expired. Please log out and log back in.');
      } else {
        setError(`Failed to load documents: ${error.message || 'Unknown error'}. Please try refreshing the page.`);
      }
    } finally {
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
    if (fileType.includes('pdf')) return <FaFilePdf className="text-red-500 text-2xl" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FaFileWord className="text-blue-500 text-2xl" />;
    if (fileType.includes('image')) return <FaImage className="text-green-500 text-2xl" />;
    return <FaFile className="text-gray-500 text-2xl" />;
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'resident': return <FaUsers className="text-blue-500" />;
      case 'public': return <FaGlobe className="text-green-500" />;
      default: return <FaUsers className="text-gray-500" />;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'resident': return 'Residents Only';
      case 'public': return 'Public Access';
      default: return 'Unknown';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to view documents.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading documents...</p>
          {user && !userData && (
            <p className="text-sm text-gray-500 mt-2">Loading user data...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-2">Access important documents and resources</p>
          
          {/* Debug info for troubleshooting */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <p><strong>Debug:</strong> User: {user?.email}, Role: {userData?.role}, Documents: {documents.length}</p>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value as 'all' | 'resident' | 'public')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Documents</option>
                <option value="resident">Residents Only</option>
                <option value="public">Public Access</option>
              </select>
            </div>
          </div>
          
          {/* Retry button if there's an error */}
          {error && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setLoading(true);
                  setError('');
                  fetchDocuments();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Loading
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-red-600" />
              <div>
                <span className="font-medium">Error:</span>
                <span className="ml-2">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Documents Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredDocuments.length === 0 && !error ? (
            <div className="text-center py-12">
              <FaFile className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm || selectedVisibility !== 'all' ? 'No documents found' : 'No documents available'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedVisibility !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Documents will appear here when they are uploaded by administrators'
                }
              </p>
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(document.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">
                        {document.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {document.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {getVisibilityIcon(document.visibility)}
                        <span>{getVisibilityLabel(document.visibility)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{formatFileSize(document.fileSize)}</span>
                    <span>{document.uploadedAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}</span>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaEye />
                      View
                    </a>
                    <a
                      href={document.fileUrl}
                      download={document.fileName}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaDownload />
                      Download
                    </a>
                  </div>

                  <div className="mt-3 text-xs text-gray-400 text-center">
                    Uploaded by {document.uploaderName}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {filteredDocuments.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredDocuments.length} of {documents.length} document{documents.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
