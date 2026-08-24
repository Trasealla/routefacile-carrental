import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  isValidSignatureDataUrl,
  KYC_SIGNED_AT_KEY,
  renderTypedSignature,
  trimCanvasToDataUrl,
} from "./kycHelpers";

/**
 * Variable-width signature pad with smooth Bezier curves between sampled
 * points. Width modulates with stroke velocity (slower = thicker), which
 * looks far more natural than a constant-width line.
 *
 * Strokes are buffered as arrays of points so we can:
 *   - support undo
 *   - re-render losslessly on resize / DPR change
 *   - rebuild from a previous full-canvas image (no stretched trimmed PNG)
 */
function SignaturePad({ initialStrokes, color, onChange, onCommit }) {
  const canvasRef = useRef(null);
  const strokesRef = useRef(initialStrokes || []);
  const drawingRef = useRef(false);
  const lastTimeRef = useRef(0);
  const lastWidthRef = useRef(2);
  const cssSizeRef = useRef({ w: 0, h: 0 });
  const dprRef = useRef(1);

  const setupCtx = (ctx) => {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color || "#1a2233";
    ctx.shadowColor = "transparent";
  };

  const renderAll = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const { w, h } = cssSizeRef.current;
    ctx.clearRect(0, 0, w, h);
    setupCtx(ctx);
    strokesRef.current.forEach((stroke) => drawStroke(ctx, stroke));
  };

  const drawStroke = (ctx, stroke) => {
    if (!stroke || stroke.length < 2) {
      if (stroke && stroke.length === 1) {
        const p = stroke[0];
        ctx.beginPath();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }
    for (let i = 1; i < stroke.length; i++) {
      const a = stroke[i - 1];
      const b = stroke[i];
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      ctx.beginPath();
      ctx.lineWidth = (a.w + b.w) / 2;
      if (i === 1) {
        ctx.moveTo(a.x, a.y);
      } else {
        const prev = stroke[i - 2];
        ctx.moveTo((prev.x + a.x) / 2, (prev.y + a.y) / 2);
      }
      ctx.quadraticCurveTo(a.x, a.y, midX, midY);
      ctx.stroke();
    }
  };

  const resize = () => {
    const c = canvasRef.current;
    if (!c) return;
    const parent = c.parentElement;
    const cssWidth = Math.max(280, parent.clientWidth);
    const cssHeight = 260;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    dprRef.current = dpr;
    cssSizeRef.current = { w: cssWidth, h: cssHeight };
    c.style.width = `${cssWidth}px`;
    c.style.height = `${cssHeight}px`;
    c.width = Math.floor(cssWidth * dpr);
    c.height = Math.floor(cssHeight * dpr);
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    setupCtx(ctx);
    renderAll();
  };

  useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvasRef.current.parentElement);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-render when color changes
  useEffect(() => {
    renderAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  const widthFromVelocity = (vel) => {
    // Map velocity (px/ms) → width. Slow = thick (3.4), fast = thin (1.2).
    const w = 3.6 - Math.min(2.4, vel * 1.6);
    const smoothed = lastWidthRef.current * 0.6 + w * 0.4;
    lastWidthRef.current = smoothed;
    return Math.max(1.0, Math.min(3.6, smoothed));
  };

  const point = (ev) => {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    const t = ev.touches && ev.touches[0];
    const cx = (t ? t.clientX : ev.clientX) - rect.left;
    const cy = (t ? t.clientY : ev.clientY) - rect.top;
    const now = performance.now();
    const last = lastTimeRef.current;
    let w;
    if (ev.pressure && ev.pressure > 0 && ev.pointerType === "pen") {
      w = 1.4 + ev.pressure * 2.6;
      lastWidthRef.current = w;
    } else {
      const stroke = strokesRef.current[strokesRef.current.length - 1];
      if (!stroke || stroke.length === 0) {
        w = 2.6;
        lastWidthRef.current = w;
      } else {
        const prev = stroke[stroke.length - 1];
        const dx = cx - prev.x;
        const dy = cy - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const dt = Math.max(1, now - last);
        w = widthFromVelocity(dist / dt);
      }
    }
    lastTimeRef.current = now;
    return { x: cx, y: cy, w };
  };

  const start = (ev) => {
    ev.preventDefault();
    drawingRef.current = true;
    lastWidthRef.current = 2.6;
    lastTimeRef.current = performance.now();
    strokesRef.current.push([]);
    const p = point(ev);
    strokesRef.current[strokesRef.current.length - 1].push(p);
    renderAll();
  };

  const move = (ev) => {
    if (!drawingRef.current) return;
    ev.preventDefault();
    const stroke = strokesRef.current[strokesRef.current.length - 1];
    const p = point(ev);
    const last = stroke[stroke.length - 1];
    if (last && Math.abs(p.x - last.x) < 0.6 && Math.abs(p.y - last.y) < 0.6) return;
    stroke.push(p);
    // incremental draw — only the latest segment
    const ctx = canvasRef.current.getContext("2d");
    if (stroke.length >= 2) {
      const a = stroke[stroke.length - 2];
      const b = stroke[stroke.length - 1];
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      ctx.beginPath();
      ctx.lineWidth = (a.w + b.w) / 2;
      if (stroke.length === 2) {
        ctx.moveTo(a.x, a.y);
      } else {
        const prev = stroke[stroke.length - 3];
        ctx.moveTo((prev.x + a.x) / 2, (prev.y + a.y) / 2);
      }
      ctx.quadraticCurveTo(a.x, a.y, midX, midY);
      ctx.stroke();
    }
  };

  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    commit();
  };

  const commit = () => {
    const c = canvasRef.current;
    const data = trimCanvasToDataUrl(c, 14);
    if (onCommit) onCommit(data, strokesRef.current.slice());
    if (onChange) onChange(data);
  };

  const undo = () => {
    if (!strokesRef.current.length) return;
    strokesRef.current.pop();
    renderAll();
    commit();
  };

  const clear = () => {
    strokesRef.current = [];
    renderAll();
    commit();
  };

  return (
    <div className="kyc-sig-pad">
      <div className="kyc-sig-pad-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="kyc-sig-canvas"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          aria-label="Signature canvas"
        />
        {strokesRef.current.length === 0 && (
          <div className="kyc-sig-placeholder" aria-hidden>
            <span>✍️</span>
            <small>Draw your signature here</small>
          </div>
        )}
        <div className="kyc-sig-baseline" aria-hidden />
        <div className="kyc-sig-x" aria-hidden>×</div>
      </div>
      <div className="kyc-sig-controls">
        <button
          type="button"
          className="kyc-btn kyc-btn-link"
          onClick={undo}
          disabled={!strokesRef.current.length}
        >
          ↶ Undo
        </button>
        <button
          type="button"
          className="kyc-btn kyc-btn-link"
          onClick={clear}
          disabled={!strokesRef.current.length}
        >
          ✕ Clear
        </button>
      </div>
    </div>
  );
}

const COLOR_OPTIONS = [
  { name: "Ink", value: "#1a2233" },
  { name: "Blue", value: "#1a4ed8" },
  { name: "Black", value: "#000000" },
];

const KycSignatureStep = ({ signature, onChange, onBack, onContinue }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(signature.signature_method || "drawn");
  const [typedName, setTypedName] = useState(signature.signature_typed_text || "");
  const [drawnPng, setDrawnPng] = useState(
    signature.signature_method === "drawn" ? signature.signature_image || "" : ""
  );
  const [strokes, setStrokes] = useState(signature.__strokes || []);
  const [editing, setEditing] = useState(!drawnPng);
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [savedAt, setSavedAt] = useState(() => {
    try {
      return window.localStorage.getItem(KYC_SIGNED_AT_KEY) || "";
    } catch {
      return "";
    }
  });

  const typedPreview = renderTypedSignature(typedName);
  const typedValid =
    typedName.trim().length >= 3 && /\s/.test(typedName.trim());
  const drawnValid = isValidSignatureDataUrl(drawnPng);
  const valid = tab === "drawn" ? drawnValid : typedValid && isValidSignatureDataUrl(typedPreview);
  const currentImage = tab === "drawn" ? drawnPng : typedPreview;

  const handleContinue = () => {
    if (!valid) return;
    onChange({
      signature_image: currentImage,
      signature_method: tab,
      signature_typed_text: tab === "typed" ? typedName.trim() : "",
      // Keep raw strokes in-memory only — lets user "Edit" with no stretch.
      __strokes: tab === "drawn" ? strokes : null,
    });
    try {
      const ts = new Date().toISOString();
      window.localStorage.setItem(KYC_SIGNED_AT_KEY, ts);
      setSavedAt(ts);
    } catch {
      /* ignore */
    }
    onContinue();
  };

  return (
    <div className="kyc-card">
      <h2 className="kyc-title">{t("Sign & Submit")}</h2>
      <p className="kyc-subtitle">
        {t(
          "Add your signature to confirm the consent above. We record the time, IP and device for verification."
        )}
      </p>

      <div className="kyc-sig-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "drawn"}
          className={`kyc-sig-tab${tab === "drawn" ? " is-active" : ""}`}
          onClick={() => setTab("drawn")}
        >
          ✍️ {t("Draw")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "typed"}
          className={`kyc-sig-tab${tab === "typed" ? " is-active" : ""}`}
          onClick={() => setTab("typed")}
        >
          ⌨️ {t("Type")}
        </button>
      </div>

      <div className="kyc-sig-legal">
        <em>
          {t(
            "By signing below, I acknowledge and agree to the AECB consent statement shown on the previous step. My signature, the time, my IP address and device are recorded for verification."
          )}
        </em>
      </div>

      {tab === "drawn" ? (
        editing ? (
          <>
            <div className="kyc-sig-toolbar">
              <span className="kyc-sig-toolbar-label">{t("Pen color")}</span>
              <div className="kyc-sig-colors" role="radiogroup" aria-label={t("Pen color")}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={color === c.value}
                    title={c.name}
                    className={`kyc-sig-color${color === c.value ? " is-active" : ""}`}
                    style={{ background: c.value }}
                    onClick={() => setColor(c.value)}
                  />
                ))}
              </div>
              {drawnPng && (
                <button
                  type="button"
                  className="kyc-btn kyc-btn-link"
                  onClick={() => setEditing(false)}
                  style={{ marginInlineStart: "auto" }}
                >
                  {t("Done editing")}
                </button>
              )}
            </div>
            <SignaturePad
              key={color}
              initialStrokes={strokes}
              color={color}
              onChange={setDrawnPng}
              onCommit={(_png, s) => setStrokes(s)}
            />
            <p className="kyc-sig-hint">
              {t("Use your mouse, finger, or stylus. Slow strokes draw thicker lines.")}
            </p>
          </>
        ) : (
          <div className="kyc-sig-preview-card">
            <div className="kyc-sig-preview-frame">
              <img src={drawnPng} alt={t("Your signature")} />
            </div>
            <div className="kyc-sig-preview-meta">
              <div className="kyc-sig-ok" aria-label={t("Signature ready")}>
                ✓ {t("Signature ready")}
              </div>
              <p className="hint">{t("Looks good. You can re-sign if you want.")}</p>
              <button
                type="button"
                className="kyc-btn kyc-btn-secondary"
                onClick={() => setEditing(true)}
              >
                ✎ {t("Re-sign")}
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="kyc-sig-typed">
          <label className="kyc-field-label">
            {t("Type your full name as it appears on your National ID")}
            <span className="req">*</span>
          </label>
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder={t("Full name")}
            className="kyc-sig-typed-input"
            autoComplete="name"
          />
          <div className="kyc-sig-typed-preview" aria-live="polite">
            {typedPreview ? (
              <img src={typedPreview} alt={t("Typed signature preview")} />
            ) : (
              <span className="hint">{t("Your signature preview appears here.")}</span>
            )}
          </div>
        </div>
      )}

      <div className="kyc-sig-meta">
        {valid && !editing && tab === "drawn" && (
          <span className="kyc-sig-ok" aria-label={t("Signature ready")}>
            ✓ {t("Signature ready")}
          </span>
        )}
        {valid && tab === "typed" && (
          <span className="kyc-sig-ok" aria-label={t("Signature ready")}>
            ✓ {t("Signature ready")}
          </span>
        )}
        {savedAt && (
          <span className="hint">
            {t("Last signed at")} {new Date(savedAt).toLocaleString()}
          </span>
        )}
      </div>

      <div className="kyc-actions">
        <button type="button" className="kyc-btn kyc-btn-secondary" onClick={onBack}>
          {t("Back")}
        </button>
        <button
          type="button"
          className="kyc-btn kyc-btn-primary"
          onClick={handleContinue}
          disabled={!valid}
        >
          {t("Continue")}
        </button>
      </div>
    </div>
  );
};

export default KycSignatureStep;
