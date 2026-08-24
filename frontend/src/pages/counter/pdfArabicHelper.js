// jsPDF cannot shape Arabic glyphs (no contextual letter joining, no bidi
// reordering) — embedding an Arabic TTF and drawing text natively renders as
// disconnected/incorrect glyphs. Browsers, however, shape and render Arabic
// correctly via the Canvas 2D API (ctx.direction = 'rtl'). So for Arabic PDF
// content we rasterize each text run to a small PNG using canvas, then embed
// that image into the PDF with doc.addImage() instead of doc.text().

const ARABIC_FONT_FAMILY = '"NotoNaskhArabicPDF", Tahoma, "Geeza Pro", sans-serif';
const PX_PER_MM = 8; // render resolution for crisp text once placed in the PDF

let fontReadyPromise = null;

// Must be called (and awaited) before the first renderArabicTextToImage() in
// a render pass — without it, canvas may fall back to a non-Arabic font on
// the very first draw before the webfont finishes loading.
export function ensureArabicFontLoaded() {
  if (!fontReadyPromise) {
    if (typeof document === 'undefined' || !document.fonts) {
      fontReadyPromise = Promise.resolve();
    } else {
      fontReadyPromise = Promise.all([
        document.fonts.load('400 16px NotoNaskhArabicPDF'),
        document.fonts.load('700 16px NotoNaskhArabicPDF'),
      ]).catch(() => {});
    }
  }
  return fontReadyPromise;
}

function ptToMm(pt) {
  return pt * 0.352778;
}

// Rasterizes `text` (Arabic script) to a PNG data URL, right-aligned within
// its own tightly-cropped box. Returns dimensions already converted to mm so
// callers can pass them straight to doc.addImage().
export function renderArabicTextToImage(text, { fontSizePt = 10, bold = false, color = '#2c3e50' } = {}) {
  const value = text === null || text === undefined || text === '' ? '-' : String(text);
  const fontSizePx = ptToMm(fontSizePt) * PX_PER_MM;
  const fontString = `${bold ? '700' : '400'} ${fontSizePx}px ${ARABIC_FONT_FAMILY}`;

  const measureCanvas = document.createElement('canvas');
  const mctx = measureCanvas.getContext('2d');
  mctx.font = fontString;
  const metrics = mctx.measureText(value);
  const paddingPx = fontSizePx * 0.18;
  const widthPx = Math.max(1, Math.ceil(metrics.width + paddingPx * 2));
  const heightPx = Math.max(1, Math.ceil(fontSizePx * 1.6));

  const canvas = document.createElement('canvas');
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');
  ctx.font = fontString;
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(value, widthPx - paddingPx, heightPx / 2 + fontSizePx * 0.04);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    widthMm: widthPx / PX_PER_MM,
    heightMm: heightPx / PX_PER_MM,
  };
}

// Draws `text` into the PDF right-aligned so its right edge sits at `rightXMm`,
// vertically centered on `centerYMm`.
export function drawArabicText(doc, text, rightXMm, centerYMm, options) {
  const { dataUrl, widthMm, heightMm } = renderArabicTextToImage(text, options);
  doc.addImage(dataUrl, 'PNG', rightXMm - widthMm, centerYMm - heightMm / 2, widthMm, heightMm);
  return { widthMm, heightMm };
}
