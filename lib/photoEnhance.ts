// Client-side product photo enhancement — no external services.
//
// Finds the background by flood-filling inward from the photo's border,
// following connected pixels of similar color (like a "magic wand" tool) —
// this follows gradients/shadows in the background much better than
// comparing every pixel to one fixed reference color. Whatever the fill
// can't reach is treated as the product. That region is fed through the
// same white-square crop/composite as before.
//
// This is a color-similarity heuristic, not real AI segmentation: it works
// well on a plain/fairly uniform background (a table, floor, wall) and
// degrades gracefully — not perfectly — on busy/patterned backgrounds.

const WORKING_MAX_DIM = 1600; // cap source resolution before any canvas work —
// camera photos can be 12MP+, and mobile browsers have canvas size/memory
// limits that raw camera resolution can exceed.
const MASK_MAX_DIM = 500; // resolution the flood fill runs at, for speed
const OUTPUT_SIZE = 1200;
const LOCAL_THRESHOLD = 26; // max color jump allowed between adjacent pixels
const GLOBAL_THRESHOLD = 70; // max color drift allowed from the seed border color

type Box = { x: number; y: number; width: number; height: number };

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

function averageBorderColor(data: Uint8ClampedArray, width: number, height: number) {
  let r = 0, g = 0, b = 0, count = 0;
  for (let x = 0; x < width; x++) {
    for (const y of [0, height - 1]) {
      const i = (y * width + x) * 4;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
    }
  }
  for (let y = 0; y < height; y++) {
    for (const x of [0, width - 1]) {
      const i = (y * width + x) * 4;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
    }
  }
  return { r: r / count, g: g / count, b: b / count };
}

// Flood-fills the background inward from the border. Returns a mask where
// 255 = background, 0 = product (foreground).
function floodFillBackgroundMask(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const seedColor = averageBorderColor(data, width, height);
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qHead = 0, qTail = 0;

  function trySeed(x: number, y: number) {
    const idx = y * width + x;
    if (!visited[idx]) {
      visited[idx] = 1;
      queue[qTail++] = idx;
    }
  }
  for (let x = 0; x < width; x++) {
    trySeed(x, 0);
    trySeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    trySeed(0, y);
    trySeed(width - 1, y);
  }

  while (qHead < qTail) {
    const idx = queue[qHead++];
    const x = idx % width;
    const y = (idx / width) | 0;
    const i = idx * 4;

    const neighbors: [number, number][] = [
      [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nIdx = ny * width + nx;
      if (visited[nIdx]) continue;
      const ni = nIdx * 4;

      const dr = data[ni] - data[i];
      const dg = data[ni + 1] - data[i + 1];
      const db = data[ni + 2] - data[i + 2];
      const localDist = Math.sqrt(dr * dr + dg * dg + db * db);

      const gdr = data[ni] - seedColor.r;
      const gdg = data[ni + 1] - seedColor.g;
      const gdb = data[ni + 2] - seedColor.b;
      const globalDist = Math.sqrt(gdr * gdr + gdg * gdg + gdb * gdb);

      if (localDist < LOCAL_THRESHOLD && globalDist < GLOBAL_THRESHOLD) {
        visited[nIdx] = 1;
        queue[qTail++] = nIdx;
      }
    }
  }

  const mask = new Uint8ClampedArray(width * height);
  for (let i = 0; i < mask.length; i++) mask[i] = visited[i] ? 255 : 0;
  return mask;
}

function maskToGrayscaleCanvas(mask: Uint8ClampedArray, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = getContext2D(canvas);
  const imageData = ctx.createImageData(width, height);
  for (let i = 0; i < mask.length; i++) {
    const v = mask[i];
    const o = i * 4;
    imageData.data[o] = v;
    imageData.data[o + 1] = v;
    imageData.data[o + 2] = v;
    imageData.data[o + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
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

function findForegroundBox(maskData: Uint8ClampedArray, width: number, height: number): Box {
  // maskData here is RGBA from the upscaled (feathered) mask canvas; red channel = background weight.
  let minX = width, minY = height, maxX = 0, maxY = 0, found = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const bgWeight = maskData[(y * width + x) * 4];
      if (bgWeight < 200) {
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

export async function enhanceProductPhoto(file: File): Promise<File> {
  const img = await loadImage(file);
  const { naturalWidth, naturalHeight } = img;
  if (!naturalWidth || !naturalHeight) {
    URL.revokeObjectURL(img.src);
    throw new Error("Image has no dimensions");
  }

  // 0. Downscale to a safe working resolution before any pixel-level work.
  const workingScale = Math.min(1, WORKING_MAX_DIM / Math.max(naturalWidth, naturalHeight));
  const workingCanvas = document.createElement("canvas");
  workingCanvas.width = Math.max(1, Math.round(naturalWidth * workingScale));
  workingCanvas.height = Math.max(1, Math.round(naturalHeight * workingScale));
  const wctx = getContext2D(workingCanvas);
  wctx.drawImage(img, 0, 0, workingCanvas.width, workingCanvas.height);
  URL.revokeObjectURL(img.src);

  // 1. Auto-balance brightness/contrast — helps the flood fill tell product
  // and background apart when the original lighting was flat/dim.
  const workingData = wctx.getImageData(0, 0, workingCanvas.width, workingCanvas.height);
  autoLevels(workingData);
  wctx.putImageData(workingData, 0, 0);

  // 2. Flood-fill the background at a small resolution (fast), producing a
  // background/foreground mask.
  const maskScale = Math.min(1, MASK_MAX_DIM / Math.max(workingCanvas.width, workingCanvas.height));
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = Math.max(1, Math.round(workingCanvas.width * maskScale));
  maskCanvas.height = Math.max(1, Math.round(workingCanvas.height * maskScale));
  const mctx = getContext2D(maskCanvas);
  mctx.drawImage(workingCanvas, 0, 0, maskCanvas.width, maskCanvas.height);
  const smallData = mctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  const mask = floodFillBackgroundMask(smallData.data, maskCanvas.width, maskCanvas.height);
  const smallMaskCanvas = maskToGrayscaleCanvas(mask, maskCanvas.width, maskCanvas.height);

  // 3. Upscale the mask to working resolution — the browser's bilinear
  // scaling naturally feathers the edge instead of a jagged pixel cutout.
  const bigMaskCanvas = document.createElement("canvas");
  bigMaskCanvas.width = workingCanvas.width;
  bigMaskCanvas.height = workingCanvas.height;
  const bmctx = getContext2D(bigMaskCanvas);
  bmctx.drawImage(smallMaskCanvas, 0, 0, bigMaskCanvas.width, bigMaskCanvas.height);
  const bigMaskData = bmctx.getImageData(0, 0, bigMaskCanvas.width, bigMaskCanvas.height);

  // 4. Blend background pixels toward white using the mask as the weight.
  for (let i = 0; i < workingData.data.length; i += 4) {
    const t = bigMaskData.data[i] / 255; // 1 = background, 0 = product
    workingData.data[i] = workingData.data[i] * (1 - t) + 255 * t;
    workingData.data[i + 1] = workingData.data[i + 1] * (1 - t) + 255 * t;
    workingData.data[i + 2] = workingData.data[i + 2] * (1 - t) + 255 * t;
  }
  wctx.putImageData(workingData, 0, 0);

  // 5. Crop to the product's bounding box (background inside it is already white).
  const box = findForegroundBox(bigMaskData.data, bigMaskCanvas.width, bigMaskCanvas.height);
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = box.width;
  cropCanvas.height = box.height;
  const cctx = getContext2D(cropCanvas);
  cctx.drawImage(workingCanvas, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);

  // 6. Composite onto a clean white square, centered with even padding.
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
