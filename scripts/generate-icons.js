import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const svgPath = path.resolve('public/favicon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 1. Standard PNG sizes for PWA & Desktop Chrome/Edge install
  const sizes = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon.png', size: 192 }
  ];

  for (const { name, size } of sizes) {
    const outputPath = path.resolve('public', name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png({ quality: 100 })
      .toFile(outputPath);
    console.log(`Generated ${name} (${size}x${size})`);
  }

  // 2. Maskable Icon (Android requires 10-15% safe padding around the logo so corners don't get clipped)
  // We place the 400x400 logo centered inside a 512x512 canvas with the brand color #020617 or #F27D26
  const innerLogo = await sharp(svgBuffer)
    .resize(410, 410)
    .png()
    .toBuffer();

  const maskablePath = path.resolve('public/pwa-maskable-512x512.png');
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 2, g: 6, b: 23, alpha: 1 } // #020617 brand dark theme
    }
  })
  .composite([
    {
      input: innerLogo,
      gravity: 'center'
    }
  ])
  .png({ quality: 100 })
  .toFile(maskablePath);
  console.log('Generated pwa-maskable-512x512.png');

  // 3. Favicon.ico (ImageMagick or sharp png fallback)
  // A 32x32 PNG renamed to favicon.ico or converted
  const icoPath = path.resolve('public/favicon.ico');
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(icoPath);
  console.log('Generated favicon.ico');

  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
