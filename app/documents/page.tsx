'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { FaSpinner, FaFile, FaImage, FaFilePdf, FaFileWord, FaDownload, FaEye, FaUsers, FaGlobe, FaSearch } from 'react-icons/fa';

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

  useEffect(() => {
    if (user && userData) {
      fetchDocuments();
    }
  }, [user, userData]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedVisibility]);

  const fetchDocuments = async () => {
    try {
      setError('');
      console.log('Fetching documents for user:', userData);
      
      // First try to get all documents and filter client-side to avoid indexing issues
      let q = query(collection(db, 'documents'));
      
      // Try with ordering if possible, but fall back to unordered if index doesn't exist
      try {
        q = query(collection(db, 'documents'), orderBy('uploadedAt', 'desc'));
      } catch (indexError) {
        console.log('Using unordered query due to missing index');
        q = query(collection(db, 'documents'));
      }
      
      const querySnapshot = await getDocs(q);
      const allDocs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Document[];
      
      console.log('All documents fetched:', allDocs);
      
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
      
      console.log('Visible documents:', visibleDocs);
      setDocuments(visibleDocs);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        setError('You do not have permission to view documents. Please contact an administrator.');
      } else if (error.code === 'unavailable') {
        setError('Service is temporarily unavailable. Please try again later.');
      } else if (error.code === 'failed-precondition') {
        setError('Database index is being built. Please try again in a few minutes.');
      } else if (error.code === 'unauthenticated') {
        setError('Please log in to view documents.');
      } else {
        setError(`Failed to load documents: ${error.message || 'Unknown error'}`);
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
              <span className="font-medium">Error:</span>
              <span>{error}</span>
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
