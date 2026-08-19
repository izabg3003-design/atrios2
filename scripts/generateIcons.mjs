import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';

function createIcon(size) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const radius = size * 0.44;
  const cornerRadius = size * 0.22;

  // Colors
  const orangeR = 249, orangeG = 115, orangeB = 22; // #F97316
  const orangeDarkR = 234, orangeDarkG = 88, orangeDarkB = 12; // #EA580C
  const cutoutR = 194, cutoutG = 65, cutoutB = 12; // #C2410C
  const silverR = 226, silverG = 232, silverB = 240; // #E2E8F0
  const silverDarkR = 148, silverDarkG = 163, silverDarkB = 184; // #94A3B8
  const whiteR = 255, whiteG = 255, whiteB = 255;

  // Helper: rounded rect distance
  function isInsideRoundedRect(x, y, rx, ry, rw, rh, r) {
    const qx = Math.abs(x - (rx + rw / 2)) - (rw / 2 - r);
    const qy = Math.abs(y - (ry + rh / 2)) - (rh / 2 - r);
    const inside = (qx <= 0 || qy <= 0) || (qx * qx + qy * qy <= r * r);
    return qx <= r && qy <= r && inside;
  }

  // Plate dimensions
  const plateX = size * 0.14;
  const plateY = size * 0.14;
  const plateW = size * 0.72;
  const plateH = size * 0.72;
  const plateR = size * 0.18;

  // Legs dimensions
  const legW = size * 0.065;
  const legH = size * 0.38;
  const legR = legW / 2;
  const leg1X = size * 0.36;
  const leg2X = size * 0.58;
  const legY = size * 0.31;

  // Barrier frame dimensions
  const barX = size * 0.26;
  const barY = size * 0.39;
  const barW = size * 0.48;
  const barH = size * 0.22;
  const barR = size * 0.055;

  const innerBarX = barX + size * 0.025;
  const innerBarY = barY + size * 0.025;
  const innerBarW = barW - size * 0.05;
  const innerBarH = barH - size * 0.05;
  const innerBarR = barR * 0.7;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      // Outer app icon squircle
      const inIcon = isInsideRoundedRect(x, y, 0, 0, size, size, cornerRadius);
      if (!inIcon) {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
        continue;
      }

      // Background Orange Gradient
      const gradT = (x + y) / (size * 2);
      let r = orangeR * (1 - gradT) + orangeDarkR * gradT;
      let g = orangeG * (1 - gradT) + orangeDarkG * gradT;
      let b = orangeB * (1 - gradT) + orangeDarkB * gradT;
      let a = 255;

      // Check if inside silver plate
      if (isInsideRoundedRect(x, y, plateX, plateY, plateW, plateH, plateR)) {
        const plateGrad = ((x - plateX) + (y - plateY)) / (plateW + plateH);
        let pr = whiteR * (1 - plateGrad * 0.6) + silverDarkR * (plateGrad * 0.6);
        let pg = whiteR * (1 - plateGrad * 0.6) + silverDarkG * (plateGrad * 0.6);
        let pb = whiteR * (1 - plateGrad * 0.6) + silverB * (plateGrad * 0.6);

        // Check if inside legs cutout
        const inLeg1 = isInsideRoundedRect(x, y, leg1X, legY, legW, legH, legR);
        const inLeg2 = isInsideRoundedRect(x, y, leg2X, legY, legW, legH, legR);
        const inBarrierInner = isInsideRoundedRect(x, y, innerBarX, innerBarY, innerBarW, innerBarH, innerBarR);
        const inBarrierOuter = isInsideRoundedRect(x, y, barX, barY, barW, barH, barR);

        if (inBarrierInner) {
          // Check diagonal stripes inside the barrier
          // Stripe angle: slope ~ -1.5
          const relX = x - innerBarX;
          const relY = y - innerBarY;
          const stripePos = (relX + relY * 0.55);
          const stripeWidth = size * 0.06;
          const stripePeriod = size * 0.12;
          const modPos = (stripePos + size) % stripePeriod;

          if (modPos < stripeWidth) {
            // Silver stripe
            r = pr;
            g = pg;
            b = pb;
          } else {
            // Orange cutout
            r = cutoutR;
            g = cutoutG;
            b = cutoutB;
          }
        } else if (inBarrierOuter) {
          // Barrier silver border frame
          r = pr * 0.95;
          g = pg * 0.95;
          b = pb * 0.95;
        } else if (inLeg1 || inLeg2) {
          // Leg cutout
          r = cutoutR;
          g = cutoutG;
          b = cutoutB;
        } else {
          // Normal silver plate
          r = pr;
          g = pg;
          b = pb;
        }
      }

      png.data[idx] = Math.round(r);
      png.data[idx + 1] = Math.round(g);
      png.data[idx + 2] = Math.round(b);
      png.data[idx + 3] = a;
    }
  }

  return png;
}

const sizes = [16, 32, 64, 192, 512];
for (const s of sizes) {
  const png = createIcon(s);
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(path.join(process.cwd(), 'public', `icon-${s}.png`), buffer);
  if (s === 192) {
    fs.writeFileSync(path.join(process.cwd(), 'public', 'icon.png'), buffer);
    fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.png'), buffer);
  }
}
console.log('Icons generated successfully in /public');
