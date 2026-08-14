// Client-side product photo enhancement — no external services.
// Estimates the background color from the photo's corners, then removes
// every pixel close to that color (replacing it with white, feathered at
// the edges), crops tightly to what's left, and auto-balances brightness.
// This is a color-distance heuristic, not real AI segmentation: it works
// well on a plain/fairly uniform background (a table, floor, wall) and
// degrades gracefully — not perfectly — on busy/patterned backgrounds.

const WORKING_MAX_DIM = 1600; // cap source resolution before any canvas work —
// camera photos can be 12MP+, and mobile browsers have canvas size/memory
// limits that raw camera resolution can exceed.
const ANALYSIS_MAX_DIM = 400;
const OUTPUT_SIZE = 1200;
const CORNER_PATCH = 14;
const BG_DISTANCE_THRESHOLD = 42;
const FEATHER = 20;

type Box = { x: number; y: number; width: number; height: number };
type RGB = { r: number; g: number; b: number };

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = URL.createObjectURL(file);
  });
}

function getContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  return ctx;
}

function averageCornerColor(data: Uint8ClampedArray, width: number, height: number): RGB {
  const patch = Math.min(CORNER_PATCH, Math.floor(width / 4), Math.floor(height / 4));
  const corners: [number, number][] = [
    [0, 0],
    [width - patch, 0],
    [0, height - patch],
    [width - patch, height - patch],
  ];
  let r = 0, g = 0, b = 0, count = 0;
  for (const [cx, cy] of corners) {
    for (let y = cy; y < cy + patch; y++) {
      for (let x = cx; x < cx + patch; x++) {
        const i = (y * width + x) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
    }
  }
  return { r: r / count, g: g / count, b: b / count };
}

function colorDistance(data: Uint8ClampedArray, i: number, bg: RGB): number {
  const dr = data[i] - bg.r;
  const dg = data[i + 1] - bg.g;
  const db = data[i + 2] - bg.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

// Replaces background-colored pixels with white (feathered at the edge)
// directly in the image data, and returns the bounding box of whatever
// pixels were kept as foreground.
function removeBackground(imageData: ImageData, bg: RGB): Box {
  const { data, width, height } = imageData;
  let minX = width, minY = height, maxX = 0, maxY = 0, found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const dist = colorDistance(data, i, bg);

      if (dist < BG_DISTANCE_THRESHOLD - FEATHER) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      } else if (dist < BG_DISTANCE_THRESHOLD + FEATHER) {
        const t = (dist - (BG_DISTANCE_THRESHOLD - FEATHER)) / (FEATHER * 2);
        data[i] = data[i] * t + 255 * (1 - t);
        data[i + 1] = data[i + 1] * t + 255 * (1 - t);
        data[i + 2] = data[i + 2] * t + 255 * (1 - t);
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      } else {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!found) return { x: 0, y: 0, width, height };
  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.08);
  const x = Math.max(0, minX - pad);
  const y = Math.max(0, minY - pad);
  return {
    x,
    y,
    width: Math.min(width - x, maxX - minX + pad * 2),
    height: Math.min(height - y, maxY - minY + pad * 2),
  };
}

function autoLevels(imageData: ImageData) {
  const { data } = imageData;
  let min = 255, max = 0;
  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (lum < min) min = lum;
    if (lum > max) max = lum;
  }
  const range = Math.max(30, max - min);
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = ((data[i + c] - min) / range) * 255;
      data[i + c] = Math.min(255, Math.max(0, v));
    }
  }
}

export async function enhanceProductPhoto(file: File): Promise<File> {
  const img = await loadImage(file);
  const { naturalWidth, naturalHeight } = img;
  if (!naturalWidth || !naturalHeight) {
    URL.revokeObjectURL(img.src);
    throw new Error("Image has no dimensions");
  }

  // 0. Downscale to a safe working resolution before any pixel-level work —
  // this is what makes large camera photos reliable across devices.
  const workingScale = Math.min(1, WORKING_MAX_DIM / Math.max(naturalWidth, naturalHeight));
  const workingCanvas = document.createElement("canvas");
  workingCanvas.width = Math.max(1, Math.round(naturalWidth * workingScale));
  workingCanvas.height = Math.max(1, Math.round(naturalHeight * workingScale));
  const wctx = getContext2D(workingCanvas);
  wctx.drawImage(img, 0, 0, workingCanvas.width, workingCanvas.height);
  URL.revokeObjectURL(img.src);

  // 1. Auto-balance brightness/contrast first — a consistently lit photo
  // makes the background-color estimate in the next step more reliable.
  const workingData = wctx.getImageData(0, 0, workingCanvas.width, workingCanvas.height);
  autoLevels(workingData);
  wctx.putImageData(workingData, 0, 0);

  // 2. Estimate background color from a downscaled copy (cheap sampling).
  const scale = Math.min(1, ANALYSIS_MAX_DIM / Math.max(workingCanvas.width, workingCanvas.height));
  const analysisCanvas = document.createElement("canvas");
  analysisCanvas.width = Math.max(1, Math.round(workingCanvas.width * scale));
  analysisCanvas.height = Math.max(1, Math.round(workingCanvas.height * scale));
  const actx = getContext2D(analysisCanvas);
  actx.drawImage(workingCanvas, 0, 0, analysisCanvas.width, analysisCanvas.height);
  const analysisData = actx.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height);
  const bg = averageCornerColor(analysisData.data, analysisCanvas.width, analysisCanvas.height);

  // 3. Remove background pixels (replace with white, feathered) across the
  // full working image, and get the bounding box of what's left.
  const box = removeBackground(workingData, bg);
  wctx.putImageData(workingData, 0, 0);

  // 4. Crop to that bounding box — background inside it is already white.
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = box.width;
  cropCanvas.height = box.height;
  const cctx = getContext2D(cropCanvas);
  cctx.drawImage(workingCanvas, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);

  // 5. Composite onto a clean white square, centered with even padding.
  const outCanvas = document.createElement("canvas");
  outCanvas.width = OUTPUT_SIZE;
  outCanvas.height = OUTPUT_SIZE;
  const octx = getContext2D(outCanvas);
  octx.fillStyle = "#ffffff";
  octx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const padding = OUTPUT_SIZE * 0.08;
  const maxDim = OUTPUT_SIZE - padding * 2;
  const fitScale = Math.min(maxDim / cropCanvas.width, maxDim / cropCanvas.height);
  const drawWidth = cropCanvas.width * fitScale;
  const drawHeight = cropCanvas.height * fitScale;
  octx.drawImage(
    cropCanvas,
    (OUTPUT_SIZE - drawWidth) / 2,
    (OUTPUT_SIZE - drawHeight) / 2,
    drawWidth,
    drawHeight
  );

  const blob: Blob = await new Promise((resolve, reject) =>
    outCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92)
  );
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}
