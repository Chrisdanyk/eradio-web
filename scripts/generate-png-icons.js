/**
 * Script to generate PNG icons from SVG
 *
 * Requirements:
 * - Install sharp: npm install --save-dev sharp
 *
 * Usage:
 * node scripts/generate-png-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if sharp is available
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.log('Sharp not found. Install it with: npm install --save-dev sharp');
  process.exit(1);
}

const iconSizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' },
];

const svgPath = path.join(__dirname, '../public/icon.svg');
const publicDir = path.join(__dirname, '../public');

async function generateIcons() {
  if (!fs.existsSync(svgPath)) {
    console.error('icon.svg not found at:', svgPath);
    process.exit(1);
  }

  console.log('Generating PNG icons from SVG...');

  for (const { size, name } of iconSizes) {
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, name));
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);

