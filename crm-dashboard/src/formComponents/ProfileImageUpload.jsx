import { useState, useRef, useCallback, useEffect } from "react";

export default function ProfileImageUpload() {
  const [preview, setPreview] = useState(null);
  const [rawDataUrl, setRawDataUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [error, setError] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const inputRef = useRef(null);
  const cropContainerRef = useRef(null);
  const cropImageRef = useRef(null);
  const canvasRef = useRef(null);

  // Crop state refs (avoid re-renders during drag)
  const imgPos = useRef({ x: 0, y: 0 });
  const boxPos = useRef({ x: 0, y: 0, size: 120 });
  const scaledDims = useRef({ w: 0, h: 0 });
  const natDims = useRef({ w: 0, h: 0 });
  const containerDims = useRef({ w: 280, h: 220 });
  const dragging = useRef({ img: false, box: false });
  const dragStart = useRef({ x: 0, y: 0, imgX: 0, imgY: 0, boxX: 0, boxY: 0 });

  const cropBoxRef = useRef(null);

  const updateScaledDims = (z = zoom) => {
    const { w: natW, h: natH } = natDims.current;
    const { w: cW, h: cH } = containerDims.current;
    const baseScale = Math.min(cW / natW, cH / natH);
    scaledDims.current = { w: natW * baseScale * z, h: natH * baseScale * z };
  };

  const clampImg = () => {
    const { x: bx, y: by, size: bs } = boxPos.current;
    const { w: sw, h: sh } = scaledDims.current;
    imgPos.current.x = Math.min(bx, Math.max(bx + bs - sw, imgPos.current.x));
    imgPos.current.y = Math.min(by, Math.max(by + bs - sh, imgPos.current.y));
  };

  const applyRender = () => {
    const img = cropImageRef.current;
    const box = cropBoxRef.current;
    if (!img || !box) return;
    img.style.left = imgPos.current.x + "px";
    img.style.top = imgPos.current.y + "px";
    img.style.width = scaledDims.current.w + "px";
    img.style.height = scaledDims.current.h + "px";
    box.style.left = boxPos.current.x + "px";
    box.style.top = boxPos.current.y + "px";
    box.style.width = boxPos.current.size + "px";
    box.style.height = boxPos.current.size + "px";
  };

  const initCrop = () => {
    const container = cropContainerRef.current;
    if (!container) return;
    const cW = container.offsetWidth;
    const cH = container.offsetHeight;
    containerDims.current = { w: cW, h: cH };
    const img = cropImageRef.current;
    natDims.current = { w: img.naturalWidth, h: img.naturalHeight };
    updateScaledDims(1);
    imgPos.current = {
      x: (cW - scaledDims.current.w) / 2,
      y: (cH - scaledDims.current.h) / 2,
    };
    const bs = Math.min(cW, cH) * 0.7;
    boxPos.current = { x: (cW - bs) / 2, y: (cH - bs) / 2, size: bs };
    applyRender();
  };

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Only image files allowed."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Max 5MB allowed."); return; }
    setError("");
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + " KB");
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawDataUrl(e.target.result);
      setCropOpen(true);
      setZoom(1);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemove = () => {
    setPreview(null);
    setRawDataUrl(null);
    setFileName("");
    setFileSize("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value);
    const oldZoom = zoom;
    const { x: bx, y: by, size: bs } = boxPos.current;
    const cx = bx + bs / 2, cy = by + bs / 2;
    const relX = cx - imgPos.current.x;
    const relY = cy - imgPos.current.y;
    updateScaledDims(newZoom);
    const scale = newZoom / oldZoom;
    imgPos.current = { x: cx - relX * scale, y: cy - relY * scale };
    clampImg();
    setZoom(newZoom);
    applyRender();
  };

  const handleMouseDownImg = (e) => {
    dragging.current.img = true;
    dragStart.current = { ...dragStart.current, x: e.clientX, y: e.clientY, imgX: imgPos.current.x, imgY: imgPos.current.y };
    e.preventDefault();
  };

  const handleMouseDownBox = (e) => {
    if (e.target !== cropBoxRef.current) return;
    dragging.current.box = true;
    dragStart.current = { ...dragStart.current, x: e.clientX, y: e.clientY, boxX: boxPos.current.x, boxY: boxPos.current.y };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (dragging.current.img) {
        imgPos.current = {
          x: dragStart.current.imgX + (e.clientX - dragStart.current.x),
          y: dragStart.current.imgY + (e.clientY - dragStart.current.y),
        };
        clampImg();
        applyRender();
      } else if (dragging.current.box) {
        const { w: cW, h: cH } = containerDims.current;
        const bs = boxPos.current.size;
        boxPos.current.x = Math.max(0, Math.min(cW - bs, dragStart.current.boxX + (e.clientX - dragStart.current.x)));
        boxPos.current.y = Math.max(0, Math.min(cH - bs, dragStart.current.boxY + (e.clientY - dragStart.current.y)));
        clampImg();
        applyRender();
      }
    };
    const onUp = () => { dragging.current.img = false; dragging.current.box = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const applyCrop = () => {
    const size = 200;
    const canvas = canvasRef.current;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    const scaleRatio = size / boxPos.current.size;
    const drawX = (imgPos.current.x - boxPos.current.x) * scaleRatio;
    const drawY = (imgPos.current.y - boxPos.current.y) * scaleRatio;
    const drawW = scaledDims.current.w * scaleRatio;
    const drawH = scaledDims.current.h * scaleRatio;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      setPreview(canvas.toDataURL("image/png"));
      setCropOpen(false);
    };
    img.src = rawDataUrl;
  };

  return (
    <>
      <div className="flex items-center gap-4 p-8 font-sans">
        {/* Avatar */}
        <div className="relative">
          <div
            onClick={() => !preview && inputRef.current?.click()}
            className={`w-[72px] h-[72px] rounded-full border-2 border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all
              ${preview ? "border-transparent" : "border-[#e9ebf0] bg-[#f4f6fa]"}`}
          >
            {preview ? (
              <img src={preview} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </div>

          {/* Edit button — opens crop modal */}
          {preview && (
            <button
              onClick={() => { setCropOpen(true); setZoom(1); }}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 border border-white flex items-center justify-center shadow-sm"
            >
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
        </div>

        {/* Info */}
        <div className="w-full max-w-xs text-left">
          <p className="text-[13px] font-[400] text-gray-700 mb-1">Profile Photo</p>
          <p className="text-[12px] text-[#6b7280] mb-2">
            {error ? (
              <span className="text-red-500">{error}</span>
            ) : fileName ? (
              <>{fileName} — {fileSize}</>
            ) : (
              "JPG, PNG · max 5 MB"
            )}
          </p>
          <div className="flex gap-2">
            {preview ? (
              <>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#6b7280] bg-white border border-[#e9ebf0] rounded-lg hover:bg-[#eff4ff] hover:border-blue-600 hover:text-blue-600 transition-colors"
                >
                  Change
                </button>
                <button
                  onClick={handleRemove}
                  className="px-2 py-1 text-xs rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              </>
            ) : (
              <button
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6b7280] bg-white border border-[#e9ebf0] rounded-lg hover:bg-[#eff4ff] hover:border-blue-600 hover:text-blue-600 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Crop Modal */}
      {cropOpen && rawDataUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-5 w-80 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-800">Crop photo</span>
              <button
                onClick={() => setCropOpen(false)}
                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Crop area */}
            <div
              ref={cropContainerRef}
              className="relative w-full h-[220px] bg-black rounded-lg overflow-hidden cursor-crosshair select-none"
              onMouseDown={handleMouseDownImg}
            >
              <img
                ref={cropImageRef}
                src={rawDataUrl}
                alt=""
                className="absolute pointer-events-none"
                style={{ transformOrigin: "0 0" }}
                onLoad={initCrop}
                draggable={false}
              />
              {/* Crop box */}
              <div
                ref={cropBoxRef}
                className="absolute cursor-move"
                style={{
                  border: "2px solid #fff",
                  borderRadius: "50%",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                }}
                onMouseDown={handleMouseDownBox}
              >
                {/* Corner handles */}
                {["-top-1.5 -left-1.5", "-top-1.5 -right-1.5", "-bottom-1.5 -left-1.5", "-bottom-1.5 -right-1.5"].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-3 h-3 bg-white rounded-full`} />
                ))}
              </div>
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-3 my-3">
              <span className="text-xs text-gray-400 w-8">Zoom</span>
              <input
                type="range" min="1" max="3" step="0.01"
                value={zoom}
                onChange={handleZoomChange}
                className="flex-1"
              />
              <span className="text-xs text-gray-400 w-8 text-right">{zoom.toFixed(1)}×</span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCropOpen(false)}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyCrop}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Apply crop
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}