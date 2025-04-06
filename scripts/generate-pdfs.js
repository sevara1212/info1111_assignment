const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const downloadsDir = path.join(__dirname, '../public/downloads');

// Create downloads directory if it doesn't exist
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

const files = [
  'building-rules.pdf',
  'emergency-procedures.pdf',
  'contact-information.pdf',
  'maintenance-request-form.pdf',
  'service-providers.pdf',
  'maintenance-schedule.pdf',
  'annual-budget.pdf',
  'financial-statements.pdf',
  'fee-schedule.pdf'
];

files.forEach(fileName => {
  const doc = new PDFDocument();
  const filePath = path.join(downloadsDir, fileName);
  const writeStream = fs.createWriteStream(filePath);
  
  doc.pipe(writeStream);
  
  // Add content to the PDF
  doc.fontSize(25).text(fileName.replace('.pdf', ''), 100, 100);
  doc.fontSize(12).text('This is a placeholder PDF file for testing purposes.', 100, 150);
  doc.fontSize(12).text('Generated on: ' + new Date().toLocaleDateString(), 100, 200);
  
  doc.end();
  
  console.log(`Generated ${fileName}`);
}); 