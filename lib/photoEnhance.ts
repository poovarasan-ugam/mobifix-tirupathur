// Client-side product photo enhancement — no external services.
// Estimates the background from the photo's corners, crops tightly to
// the product, composites it onto a clean white square, and auto-balances
// brightness/contrast. Works best on plain/uniform backgrounds; on busy
// backgrounds it degrades gracefully to a looser crop rather than failing.

const WORKING_MAX_DIM = 1600; // cap source resolution before any canvas work —
// camera photos can be 12MP+, and mobile browsers have canvas size/memory
// limits that raw camera resolution can exceed.
const ANALYSIS_MAX_DIM = 400;
const OUTPUT_SIZE = 1200;
const CORNER_PATCH = 14;
const BG_DISTANCE_THRESHOLD = 38;

type Box = { x: number; y: number; width: number; height: number };

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = URL.createObjectURL(file);
  });
}

function averageCornerColor(data: Uint8ClampedArray, width: number, height: number) {
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

function findForegroundBox(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  bg: { r: number; g: number; b: number }
): Box {
  let minX = width, minY = height, maxX = 0, maxY = 0, found = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const dr = data[i] - bg.r;
      const dg = data[i + 1] - bg.g;
      const db = data[i + 2] - bg.b;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist > BG_DISTANCE_THRESHOLD) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!found) return { x: 0, y: 0, width, height };
  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.1);
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

function canvasToImageData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export async function enhanceProductPhoto(file: File): Promise<File> {
  const img = await loadImage(file);
  const { naturalWidth, naturalHeight } = img;
  if (!naturalWidth || !naturalHeight) {
    URL.revokeObjectURL(img.src);
    throw new Error("Image has no dimensions");
  }

  // 0. Downscale to a safe working resolution first, before any pixel-level
  // work — this is what makes large camera photos reliable across devices.
  const workingScale = Math.min(1, WORKING_MAX_DIM / Math.max(naturalWidth, naturalHeight));
  const workingCanvas = document.createElement("canvas");
  workingCanvas.width = Math.max(1, Math.round(naturalWidth * workingScale));
  workingCanvas.height = Math.max(1, Math.round(naturalHeight * workingScale));
  const wctx = workingCanvas.getContext("2d");
  if (!wctx) throw new Error("Canvas 2D context unavailable");
  wctx.drawImage(img, 0, 0, workingCanvas.width, workingCanvas.height);
  URL.revokeObjectURL(img.src);

  const width = workingCanvas.width;
  const height = workingCanvas.height;

  // 1. Downscaled analysis pass to find the crop box cheaply.
  const scale = Math.min(1, ANALYSIS_MAX_DIM / Math.max(width, height));
  const analysisCanvas = document.createElement("canvas");
  analysisCanvas.width = Math.max(1, Math.round(width * scale));
  analysisCanvas.height = Math.max(1, Math.round(height * scale));
  const actx = analysisCanvas.getContext("2d");
  if (!actx) throw new Error("Canvas 2D context unavailable");
  actx.drawImage(workingCanvas, 0, 0, analysisCanvas.width, analysisCanvas.height);
  const analysisData = canvasToImageData(analysisCanvas);
  const bg = averageCornerColor(analysisData.data, analysisCanvas.width, analysisCanvas.height);
  const smallBox = findForegroundBox(analysisData.data, analysisCanvas.width, analysisCanvas.height, bg);

  // 2. Scale the box back up to the working resolution and crop.
  const box: Box = {
    x: Math.round(smallBox.x / scale),
    y: Math.round(smallBox.y / scale),
    width: Math.max(1, Math.round(smallBox.width / scale)),
    height: Math.max(1, Math.round(smallBox.height / scale)),
  };
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = box.width;
  cropCanvas.height = box.height;
  const cctx = cropCanvas.getContext("2d");
  if (!cctx) throw new Error("Canvas 2D context unavailable");
  cctx.drawImage(workingCanvas, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);

  // 3. Auto-balance brightness/contrast on the cropped product.
  const cropData = canvasToImageData(cropCanvas);
  autoLevels(cropData);
  cctx.putImageData(cropData, 0, 0);

  // 4. Composite onto a clean white square, centered with even padding.
  const outCanvas = document.createElement("canvas");
  outCanvas.width = OUTPUT_SIZE;
  outCanvas.height = OUTPUT_SIZE;
  const octx = outCanvas.getContext("2d");
  if (!octx) throw new Error("Canvas 2D context unavailable");
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
