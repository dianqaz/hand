/*
 * Custom Spectrum Renderer
 * This script runs as the body of the render function.
 * Available variables:
 * - ctx: CanvasRenderingContext2D
 * - width: number (canvas width)
 * - height: number (canvas height)
 * - timeMs: number (elapsed time in milliseconds)
 * - isPlaying: boolean
 * - imgElement: HTMLImageElement | null
 * - shouldClear: boolean
 * - dataArray: Uint8Array | undefined (frequency data)
 * - hasRealData: boolean
 */

const time = timeMs / 1000;
if (shouldClear) {
  ctx.clearRect(0, 0, width, height);
}

const centerX = width / 2;
const centerY = height / 2;

let bounceAvg = 0;

if (isPlaying) {
  if (hasRealData && dataArray) {
    let highSum = 0;
    const startBin = Math.floor(dataArray.length * 0.5);
    const endBin = Math.floor(dataArray.length * 0.85);
    let binCount = endBin - startBin;
    
    for (let b = startBin; b < endBin; b++) {
        highSum += dataArray[b];
    }
    bounceAvg = binCount > 0 ? (highSum / binCount) : 0;
    bounceAvg = Math.min(255, bounceAvg * 1.5);
  } else {
    bounceAvg = Math.abs(Math.sin(time * Math.PI * 2) * 50 + Math.sin(time * 8.3) * 50);
  }
}

let imgAngle = isPlaying ? time * 0.5 : 0;
let baseRadius = Math.min(width, height) * 0.28;
let maxOutLength = Math.min(width, height) * 0.20;
let barCount = 90;

// --- MODIFIKASI: Menghitung lebar mendatar alih-alih keliling lingkaran ---
let drawableWidth = (width / 2) - baseRadius - 20; // Sisa ruang horizontal setelah gambar tengah
if (drawableWidth < 10) drawableWidth = 10; // Fallback jika layar terlalu kecil
let barSpacing = drawableWidth / barCount;
let barWidth = barSpacing * 0.7;

ctx.globalCompositeOperation = 'lighter';
ctx.lineCap = 'butt';

function getColor(normalizedY) {
  let r = 200 + (0 - 200) * normalizedY;
  let g = 0 + (220 - 0) * normalizedY;
  let b = 255;
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// --- MODIFIKASI: Fungsi gambar bar diubah menjadi vertikal (mengarah ke atas dari garis tengah) ---
function drawVerticalBar(x, y, inLen, outLen, w, color) {
  let startX = x;
  let startY = y + inLen;
  let endX = x;
  let endY = y - outLen; // Bar mengarah ke atas (Y negatif)

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.lineWidth = w;
  ctx.strokeStyle = color;
  ctx.shadowBlur = 12;
  ctx.shadowColor = color;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

for (let i = 0; i < barCount; i++) {
  let normalizedValue = 0;
  
  if (isPlaying) {
    if (hasRealData && dataArray) {
      let dataIndex = Math.floor(i * ((dataArray.length * 0.6) / barCount));
      let val = dataArray[dataIndex] || 0;
      normalizedValue = val / 255;
    } else {
      const freq = i / barCount;
      const wave1 = Math.max(0, Math.sin(time * 15 + freq * 10));
      const wave2 = Math.max(0, Math.sin(time * 7.3 - freq * 20));
      const wave3 = Math.max(0, Math.sin(time * 23 + freq * 5));
      normalizedValue = (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2) * (1 - freq * 0.5); 
    }
  }
  
  let powerValue = Math.pow(normalizedValue, 1.4);
  let idle = isPlaying ? (Math.sin(i * 0.2 + time * 3) * 3 + 3) : 2;
  let outLength = (powerValue * maxOutLength) + idle;
  let inLength = 0;

  let ratio = i / barCount;
  let normalizedY = (Math.sin(-Math.PI / 2 + (ratio * Math.PI)) + 1) / 2;
  let color = getColor(normalizedY);

  // --- MODIFIKASI: Mengatur posisi bar menjauh secara horizontal ke kiri & kanan ---
  let xOffset = baseRadius + (i * barSpacing);

  // Sisi Kanan
  drawVerticalBar(centerX + xOffset, centerY, inLength, outLength, barWidth, color);

  // Sisi Kiri
  if (i > 0 && i < barCount) {
    drawVerticalBar(centerX - xOffset, centerY, inLength, outLength, barWidth, color);
  }
}

// Ring border
ctx.globalCompositeOperation = 'source-over';
ctx.beginPath();
ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
ctx.strokeStyle = '#050212';
ctx.lineWidth = 4;
ctx.shadowBlur = 0;
ctx.stroke();

// Center image drawing
if (imgElement && imgElement.complete) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(imgAngle);
  
  let pulseScale = 1 + (bounceAvg / 255) * 0.35;
  ctx.scale(pulseScale, pulseScale);
  
  let imgSize = baseRadius * 1.8;
  ctx.drawImage(imgElement, -imgSize/2, -imgSize/2, imgSize, imgSize);
  ctx.restore();
}