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

let maxOutLength = Math.min(width, height) * 0.20;
let barCount = 90;

// Ruang horizontal dari tengah layar ke tepi pinggir layar
let drawableWidth = (width / 2) - 20; 
if (drawableWidth < 10) drawableWidth = 10; 

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

function drawVerticalBar(x, y, inLen, outLen, w, color) {
  let startX = x;
  let startY = y + inLen;
  let endX = x;
  let endY = y - outLen; // Bar mengarah ke atas

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

  // Menentukan titik X mulai murni dari tengah (0) menyebar ke pinggir
  let xOffset = i * barSpacing;

  // Render Sisi Kanan
  drawVerticalBar(centerX + xOffset, centerY, inLength, outLength, barWidth, color);

  // Render Sisi Kiri
  if (i > 0 && i < barCount) {
    drawVerticalBar(centerX - xOffset, centerY, inLength, outLength, barWidth, color);
  }
}
