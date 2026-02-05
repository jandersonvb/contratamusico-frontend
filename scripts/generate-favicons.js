/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_IMAGE = path.join(__dirname, '../public/images/logo.png');
const PUBLIC_DIR = path.join(__dirname, '../public');
const APP_DIR = path.join(__dirname, '../app');

const SIZES = {
  // Next.js App Router conventions (placed in app/)
  'icon.png': { size: 32, path: APP_DIR },
  'apple-icon.png': { size: 180, path: APP_DIR }, // Apple touch icon
  'opengraph-image.png': { size: [1200, 630], path: APP_DIR }, // Open Graph
  'twitter-image.png': { size: [1200, 630], path: APP_DIR }, // Twitter

  // Standard Favicon (placed in public/)
  'favicon.ico': { sizes: [16, 32, 48], path: PUBLIC_DIR, format: 'ico' },
  
  // Web App Manifest icons (placed in public/icons/)
  'android-chrome-192x192.png': { size: 192, path: path.join(PUBLIC_DIR, 'icons') },
  'android-chrome-512x512.png': { size: 512, path: path.join(PUBLIC_DIR, 'icons') },
  'favicon-16x16.png': { size: 16, path: path.join(PUBLIC_DIR, 'icons') },
  'favicon-32x32.png': { size: 32, path: path.join(PUBLIC_DIR, 'icons') },
};

async function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function generateIcons() {
  try {
    console.log('🎨 Starting icon generation...');
    
    if (!fs.existsSync(SOURCE_IMAGE)) {
      throw new Error(`Source image not found at: ${SOURCE_IMAGE}`);
    }

    // Ensure output directories exist
    await ensureDir(PUBLIC_DIR);
    await ensureDir(APP_DIR);
    await ensureDir(path.join(PUBLIC_DIR, 'icons'));

    // Read source image
    const imageBuffer = fs.readFileSync(SOURCE_IMAGE);

    for (const [filename, config] of Object.entries(SIZES)) {
      const outputPath = path.join(config.path, filename);
      
      if (config.format === 'ico') {
        // Generate favicon.ico
        console.log(`Generating ${filename}...`);
        await sharp(imageBuffer)
          .resize(32, 32, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
             
      } else {
        console.log(`Generating ${filename}...`);
        const width = Array.isArray(config.size) ? config.size[0] : config.size;
        const height = Array.isArray(config.size) ? config.size[1] : config.size;

        await sharp(imageBuffer)
          .resize(width, height, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
      }
    }

    console.log('✅ All icons generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
