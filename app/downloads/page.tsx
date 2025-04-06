"use client";

import { useState } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaDownload } from 'react-icons/fa';
import styles from './styles.module.css';

interface File {
  name: string;
  path: string;
}

interface Folder {
  name: string;
  files: File[];
}

export default function DownloadsPage() {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const folders: Folder[] = [
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
      setDownloading(prev => ({ ...prev, [file.path]: true }));

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
    } catch (err) {
      setError('Failed to download the file. Please try again.');
      console.error('Download error:', err);
    } finally {
      setDownloading(prev => ({ ...prev, [file.path]: false }));
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
              >
                <div className={styles.folderName}>
                  {expandedFolders[folder.name] ? <FaFolderOpen className={styles.folderIcon} /> : <FaFolder className={styles.folderIcon} />}
                  {folder.name}
                </div>
              </div>
              
              {expandedFolders[folder.name] && (
                <div className={styles.fileList}>
                  {folder.files.map((file) => (
                    <div key={file.path} className={styles.fileItem}>
                      <div className={styles.fileName}>
                        <FaFile className={styles.fileIcon} />
                        {file.name}
                      </div>
                      <button
                        onClick={() => handleDownload(file)}
                        className={styles.downloadButton}
                        disabled={downloading[file.path]}
                      >
                        <FaDownload />
                        {downloading[file.path] ? 'Downloading...' : 'Download'}
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