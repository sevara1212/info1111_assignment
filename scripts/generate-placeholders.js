const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const positions = [
  'security',
  'stratamanager',
  'buildingmanager',
  'treasurer',
  'secretary',
  'chairperson'
];

const colors = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444'  // red
];

const generateImage = (position, color) => {
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 400, 400);

  // Draw text
  ctx.fillStyle = 'white';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const words = position.split(/(?=[A-Z])/);
  words.forEach((word, i) => {
    ctx.fillText(word, 200, 180 + (i * 50));
  });

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, '../public/images', `${position.toLowerCase()}.png`), buffer);
};

// Create images directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, '../public/images'))) {
  fs.mkdirSync(path.join(__dirname, '../public/images'), { recursive: true });
}

// Generate images
positions.forEach((position, index) => {
  generateImage(position, colors[index]);
}); 