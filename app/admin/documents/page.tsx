'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc } from 'firebase/firestore';

interface DocumentFile {
  id: string;
  name: string;
  fileName: string;
  url: string;
}

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'documents'), (snap) => {
      setDocs(snap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || '',
        fileName: doc.data().fileName || '',
        url: doc.data().url || '',
      })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `documents/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed', (snapshot) => {
        setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      });
      await uploadTask;
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'documents'), {
        name: file.name,
        fileName: file.name,
        url,
        uploadedAt: new Date(),
      });
    } catch (err) {
      alert('Upload failed!');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Document Management</h1>
      <div className="mb-4 text-lg font-semibold text-green-700">{docs.length} files</div>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      <label htmlFor="file-upload">
        <button
          className="mb-4 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
          disabled={uploading}
        >
          {uploading ? `Uploading... (${uploadProgress}%)` : 'Upload New File'}
        </button>
      </label>
      {loading ? <div>Loading...</div> : (
        <ul className="bg-white rounded-xl shadow divide-y">
          {docs.map((d) => (
            <li key={d.id} className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="inline-block w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                  {d.fileName?.split('.').pop()?.toUpperCase() || 'DOC'}
                </span>
                <span className="font-medium">{d.name || d.fileName}</span>
              </div>
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Download</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 