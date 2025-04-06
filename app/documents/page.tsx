import React from 'react';

const documents = [
  {
    folder: "General Information",
    files: [
      { name: "Welcome Guide", path: "public/downloads/general-information/Welcome Guide.pdf" },
      { name: "Emergency Procedures", path: "public/downloads/general-information/Emergency Procedures.pdf" },
      { name: "Building Layout", path: "public/downloads/general-information/Building Layout.pdf" },
      { name: "Resident Handbook", path: "public/downloads/general-information/Resident Handbook.docx" },
    ],
  },
  {
    folder: "Maintenance and Services",
    files: [
      { name: "Service Schedule", path: "public/downloads/maintenance-services/Service Schedule.pdf" },
      { name: "Utility Information", path: "public/downloads/maintenance-services/Utility Information.pdf" },
      { name: "Waste Management Guide", path: "public/downloads/maintenance-services/Waste Management Guide.pdf" },
    ],
  },
  {
    folder: "Financial Documents",
    files: [
      { name: "Monthly Levies", path: "public/downloads/financial-documents/Monthly Levies.pdf" },
      { name: "Financial Statements", path: "public/downloads/financial-documents/Financial Statements.pdf" },
      { name: "Insurance Policy", path: "public/downloads/financial-documents/Insurance Policy.pdf" },
    ],
  },
];

export default function DownloadsPage() {
  return (
    <div className="min-h-screen p-6 bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">Downloads</h1>
      {documents.map((folder, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">{folder.folder}</h2>
          <ul className="space-y-2">
            {folder.files.map((file, idx) => (
              <li key={idx}>
                <a
                  href={file.path}
                  download
                  className="text-blue-400 hover:underline"
                >
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
