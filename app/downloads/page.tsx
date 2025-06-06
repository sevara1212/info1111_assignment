"use client";

import { useState, useEffect } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaDownload } from 'react-icons/fa';
import styles from './styles.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

// Optionally, import a logo image if available
// import logoPng from '@/public/images/sevara_apartments.png';

interface File {
  name: string;
  path?: string;
  generate?: () => Promise<void>;
  firebaseUrl?: string;
  isFirebaseFile?: boolean;
}

interface Folder {
  name: string;
  files: File[];
}

interface FirebaseDocument {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: any;
  visibility: string;
}

async function generateCertificate(userData: any) {
  if (!userData) return;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 440]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  // Optionally, use a serif font for the main text if available
  // const fontSerif = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const name = userData.name;
  const unit = userData.unit || userData.apartment || '-';
  const date = new Date().toLocaleDateString();
  const certId = uuidv4();

  // Blue/Gold border
  page.drawRectangle({ x: 10, y: 10, width: 580, height: 420, borderColor: rgb(0.1, 0.2, 0.7), borderWidth: 4 });
  page.drawRectangle({ x: 18, y: 18, width: 564, height: 404, borderColor: rgb(0.85, 0.65, 0.13), borderWidth: 2 });

  // Subtle background (light blue)
  page.drawRectangle({ x: 20, y: 20, width: 560, height: 400, color: rgb(0.96, 0.98, 1), opacity: 0.5 });

  // Watermark
  page.drawText('Sevara Apartments', {
    x: 80, y: 200, size: 50, font: fontBold, color: rgb(0.9, 0.9, 0.9), rotate: degrees(30), opacity: 0.13
  });

  // Logo (if available)
  // const logoBytes = await fetch('/images/sevara_apartments.png').then(res => res.arrayBuffer());
  // const logoImg = await pdfDoc.embedPng(logoBytes);
  // page.drawImage(logoImg, { x: 260, y: 370, width: 80, height: 40 });
  // If no logo, leave space
  page.drawRectangle({ x: 260, y: 370, width: 80, height: 40, borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 1 });

  // Title
  page.drawText('Certificate of Residency', {
    x: 90, y: 350, size: 30, font: fontBold, color: rgb(0.1, 0.2, 0.7)
  });

  // Main text
  page.drawText('This is to certify that', { x: 60, y: 310, size: 15, font, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(name, { x: 220, y: 310, size: 15, font: fontBold, color: rgb(0.1, 0.2, 0.7) });
  page.drawText('resides at unit', { x: 60, y: 290, size: 15, font, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(unit, { x: 160, y: 290, size: 15, font: fontBold, color: rgb(0.1, 0.2, 0.7) });
  page.drawText('and is an approved resident of Sevara Apartments.', { x: 200, y: 290, size: 15, font, color: rgb(0.1, 0.1, 0.1) });

  // Details
  page.drawText('Date of Issue:', { x: 60, y: 250, size: 13, font, color: rgb(0.2, 0.2, 0.2) });
  page.drawText(date, { x: 150, y: 250, size: 13, font, color: rgb(0.1, 0.2, 0.7) });
  page.drawText('Certificate ID:', { x: 60, y: 230, size: 13, font, color: rgb(0.2, 0.2, 0.2) });
  page.drawText(certId, { x: 150, y: 230, size: 13, font, color: rgb(0.1, 0.2, 0.7) });

  // QR code (verification section)
  const qrData = JSON.stringify({ certId, name, unit, date });
  const qrUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 120 });
  const pngImageBytes = await fetch(qrUrl).then(res => res.arrayBuffer());
  const qrImage = await pdfDoc.embedPng(pngImageBytes);
  // Draw a box for the QR code
  page.drawRectangle({ x: 440, y: 60, width: 120, height: 120, borderColor: rgb(0.1, 0.2, 0.7), borderWidth: 1.5, color: rgb(0.98, 0.99, 1), opacity: 0.7 });
  page.drawImage(qrImage, { x: 450, y: 70, width: 100, height: 100 });
  page.drawText('Scan to verify', { x: 460, y: 60, size: 11, font, color: rgb(0.2, 0.2, 0.2) });
  page.drawText('Verification QR', { x: 460, y: 175, size: 10, font, color: rgb(0.1, 0.2, 0.7) });

  // Signature line and label
  page.drawText('_________________________', { x: 60, y: 90, size: 14, font, color: rgb(0.2, 0.2, 0.2) });
  page.drawText('Sevara Apartments Management', { x: 60, y: 70, size: 14, font: fontBold, color: rgb(0.1, 0.2, 0.7) });
  // Optionally, add a signature image if available
  // const sigBytes = await fetch('/images/signature.png').then(res => res.arrayBuffer());
  // const sigImg = await pdfDoc.embedPng(sigBytes);
  // page.drawImage(sigImg, { x: 60, y: 100, width: 80, height: 30 });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Certificate_of_Residency_${name}_${unit}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DownloadsPage() {
  const { userData, user } = useAuth();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [firebaseDocuments, setFirebaseDocuments] = useState<FirebaseDocument[]>([]);
  const [loadingFirebase, setLoadingFirebase] = useState(true);

  // Fetch Firebase documents
  useEffect(() => {
    const fetchFirebaseDocuments = async () => {
      if (!user) {
        setLoadingFirebase(false);
        return;
      }

      try {
        console.log('Fetching documents from Firebase for downloads page...');
        const documentsQuery = query(collection(db, 'documents'));
        const snapshot = await getDocs(documentsQuery);
        
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirebaseDocument[];

        // Filter based on user role and visibility
        let visibleDocs = docs;
        if (userData?.role !== 'admin') {
          visibleDocs = docs.filter(doc => 
            doc.visibility === 'resident' || doc.visibility === 'public'
          );
        }

        // Sort by upload date (newest first)
        visibleDocs.sort((a, b) => {
          const dateA = a.uploadedAt?.toDate?.() || new Date(0);
          const dateB = b.uploadedAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        console.log('Loaded Firebase documents for downloads:', visibleDocs);
        setFirebaseDocuments(visibleDocs);
      } catch (error) {
        console.error('Error fetching Firebase documents:', error);
        setError('Failed to load uploaded documents');
      } finally {
        setLoadingFirebase(false);
      }
    };

    fetchFirebaseDocuments();
  }, [user, userData]);

  // Convert Firebase documents to File format
  const createFirebaseFiles = (): File[] => {
    return firebaseDocuments.map(doc => ({
      name: doc.title || doc.fileName,
      firebaseUrl: doc.fileUrl,
      isFirebaseFile: true
    }));
  };

  const folders: Folder[] = [
    {
      name: 'New Uploads',
      files: createFirebaseFiles()
    },
    {
      name: 'General Information',
      files: [
        { name: 'Welcome Guide.pdf', path: '/downloads/general-information/Welcome Guide.pdf' },
        { name: 'Emergency Procedures.pdf', path: '/downloads/general-information/Emergency Procedures.pdf' },
        { name: 'Building Layout.pdf', path: '/downloads/general-information/Building Layout.pdf' },
        { name: 'Resident Handbook.pdf', path: '/downloads/general-information/Resident Handbook.pdf' },
      ]
    },
    {
      name: 'Maintenance and Services',
      files: [
        { name: 'Service Schedule.pdf', path: '/downloads/maintenance-services/Service Schedule.pdf' },
        { name: 'Utility Information.pdf', path: '/downloads/maintenance-services/Utility Information.pdf' },
        { name: 'Waste Management Guide.pdf', path: '/downloads/maintenance-services/Waste Management Guide.pdf' },
      ]
    },
    {
      name: 'Financial Documents',
      files: [
        { name: 'Monthly Levies.pdf', path: '/downloads/financial-documents/Monthly Levies.pdf' },
        { name: 'Financial Statements.pdf', path: '/downloads/financial-documents/Financial Statements.pdf' },
        { name: 'Insurance Policy.pdf', path: '/downloads/financial-documents/Insurance Policy.pdf' },
      ]
    },
    {
      name: 'Residency',
      files: [
        { name: 'Certificate of Residency.pdf', generate: () => generateCertificate(userData) }
      ]
    }
  ];

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const handleDownload = async (file: File) => {
    try {
      setError(null);
      setDownloading(prev => ({ ...prev, [file.path || file.firebaseUrl || file.name]: true }));
      
      if (file.generate) {
        // Generated files (like certificates)
        await file.generate();
      } else if (file.isFirebaseFile && file.firebaseUrl) {
        // Firebase files - direct download from Firebase Storage URL
        console.log('Downloading Firebase file:', file.name, file.firebaseUrl);
        const a = document.createElement('a');
        a.href = file.firebaseUrl;
        a.download = file.name;
        a.target = '_blank'; // Open in new tab to avoid CORS issues
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (file.path) {
        // Static files from public folder
        const response = await fetch(file.path);
        if (!response.ok) {
          throw new Error('File not found');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('No download method available for this file');
      }
    } catch (err) {
      setError('Failed to download the file. Please try again.');
      console.error('Download error:', err);
    } finally {
      setDownloading(prev => ({ ...prev, [file.path || file.firebaseUrl || file.name]: false }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Downloads</h1>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.folderList}>
          {folders.map((folder) => (
            <div key={folder.name} className={styles.folder}>
              <div 
                className={styles.folderHeader}
                onClick={() => toggleFolder(folder.name)}
                style={{
                  backgroundColor: folder.name === 'New Uploads' ? '#f0f9ff' : undefined,
                  borderLeft: folder.name === 'New Uploads' ? '4px solid #38A169' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  padding: '16px 20px',
                  fontSize: '18px',
                  fontWeight: '600'
                }}
              >
                <div style={{ marginRight: '12px', fontSize: '20px' }}>
                  {expandedFolders[folder.name] ? <FaFolderOpen /> : <FaFolder />}
                </div>
                <span style={{ flex: 1, textAlign: 'left' }}>{folder.name}</span>
              </div>
              
              {expandedFolders[folder.name] && (
                <div className={styles.fileList}>
                  {folder.files.map((file) => (
                    <div key={file.path || file.name} className={styles.fileItem}>
                      <div className={styles.fileName}>
                        <FaFile className={styles.fileIcon} />
                        {file.name}
                      </div>
                      <button
                        onClick={() => handleDownload(file)}
                        className={styles.downloadButton}
                        disabled={downloading[file.path || file.firebaseUrl || file.name]}
                      >
                        <FaDownload />
                        {downloading[file.path || file.firebaseUrl || file.name] ? 'Downloading...' : 'Download'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 