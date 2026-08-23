import { useState, useRef } from "react";

// ─────────────────────────────────────────────
// Utils
// ─────────────────────────────────────────────
function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(0) + " KB";
}

// ─────────────────────────────────────────────
// ImageIcon
// ─────────────────────────────────────────────
function ImageIcon({ className = "w-4 h-4 text-gray-400" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// FieldLabel
// ─────────────────────────────────────────────
function FieldLabel({ label, required = false, right }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <ImageIcon className="w-4 h-4 text-red-400" />
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        {required && <span className="text-red-500 text-sm leading-none">*</span>}
      </div>
      {right && <span className="text-xs text-gray-400">{right}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────
// FieldMessage
// ─────────────────────────────────────────────
function FieldMessage({ error, success, hint }) {
  if (error)
    return (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <span className="w-3.5 h-3.5 rounded-full border border-red-400 inline-flex items-center justify-center text-[10px]">!</span>
        {error}
      </p>
    );
  if (success)
    return (
      <p className="text-xs text-green-600 flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        {success}
      </p>
    );
  if (hint) return <p className="text-xs text-gray-400">{hint}</p>;
  return null;
}

// ─────────────────────────────────────────────
// DropZone
// ─────────────────────────────────────────────
function DropZone({ onFiles, multiple = false, maxMB = 4, aspectRatio = "16/9", error, disabled = false, hint }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); if (!disabled) onFiles?.(e.dataTransfer.files); }}
      style={{ aspectRatio }}
      className={[
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all select-none bg-blue-50",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        dragOver ? "border-blue-500 bg-blue-100" : error ? "border-red-400 bg-red-50" : "border-blue-300 hover:border-blue-400 hover:bg-blue-100",
      ].join(" ")}
    >
      <ImageIcon className="w-9 h-9 text-blue-300" />
      <p className="text-sm text-gray-500 font-medium">Click or drag image here</p>
      <p className="text-xs text-gray-400">{hint ?? `PNG, JPG, WEBP · max ${maxMB} MB${multiple ? " each" : ""}`}</p>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => onFiles?.(e.target.files)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// ImageThumbnail
// ─────────────────────────────────────────────
function ImageThumbnail({ image, isCover = false, isError = false, isDragOver = false, disabled = false, onRemove, onSetCover, onAddClick, dragProps = {} }) {
  const isEmpty = !image;

  if (isEmpty)
    return (
      <div
        onClick={() => !disabled && onAddClick?.()}
        style={{ aspectRatio: "1/1" }}
        className={[
          "relative rounded-xl flex items-center justify-center border-2 border-dashed transition-all select-none",
          disabled ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50" : "cursor-pointer border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50",
        ].join(" ")}
      >
        <span className="text-2xl text-gray-300">+</span>
      </div>
    );

  if (isError)
    return (
      <div style={{ aspectRatio: "1/1" }} className="relative rounded-xl border-2 border-red-400 bg-red-50 flex items-center justify-center">
        <div className="w-9 h-9 rounded-full border-2 border-red-400 flex items-center justify-center">
          <span className="text-red-400 text-lg">×</span>
        </div>
        {!disabled && (
          <button onClick={(e) => { e.stopPropagation(); onRemove?.(); }} className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-700 transition-colors">×</button>
        )}
      </div>
    );

  return (
    <div
      {...dragProps}
      style={{ aspectRatio: "1/1" }}
      className={["relative rounded-xl overflow-hidden transition-all cursor-grab", isDragOver ? "scale-95 opacity-70" : ""].join(" ")}
    >
      <img src={image.url} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 rounded-xl border-2 border-blue-400 pointer-events-none" />
      {isCover ? (
        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-gray-900/80 text-white text-[10px] font-semibold rounded">Cover</span>
      ) : (
        <button onClick={(e) => { e.stopPropagation(); onSetCover?.(); }} className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 text-white/70 text-[10px] rounded opacity-0 hover:opacity-100 transition-opacity">
          Set cover
        </button>
      )}
      {!disabled && (
        <button onClick={(e) => { e.stopPropagation(); onRemove?.(); }} className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gray-900/70 text-white flex items-center justify-center text-xs hover:bg-red-600 transition-colors">×</button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SingleImageUpload
// ─────────────────────────────────────────────
export function SingleImageUpload({ label = "Cover Image", required = false, maxMB = 4, value, onChange, error, disabled = false }) {
  const [internal, setInternal] = useState(null);
  const inputRef = useRef(null);

  const isControlled = value !== undefined;
  const image = isControlled ? (value ? { file: value, url: URL.createObjectURL(value) } : null) : internal;

  const setImage = (img) => {
    if (!isControlled) setInternal(img);
    onChange?.(img?.file ?? null);
  };

  const handleFiles = (files) => {
    if (disabled) return;
    const file = Array.from(files).find((f) => f.type.startsWith("image/") && f.size <= maxMB * 1024 * 1024);
    if (file) setImage({ file, url: URL.createObjectURL(file) });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel label={label} required={required} />
      {image ? (
        <div className="relative w-full rounded-xl overflow-hidden border border-gray-100" style={{ aspectRatio: "16/9" }}>
          <img src={image.url} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2 bg-black/55">
            <span className="text-white text-xs truncate max-w-[55%]">{image.file.name} · {formatSize(image.file.size)}</span>
            <div className="flex gap-2 shrink-0">
              <button disabled={disabled} onClick={() => inputRef.current?.click()} className="px-2.5 py-1 text-xs rounded-md bg-white/15 text-white border border-white/25 hover:bg-white/25 transition-colors disabled:opacity-40">Replace</button>
              <button disabled={disabled} onClick={() => setImage(null)} className="px-2.5 py-1 text-xs rounded-md bg-white/15 text-white border border-white/25 hover:bg-red-500/70 transition-colors disabled:opacity-40">Remove</button>
            </div>
          </div>
        </div>
      ) : (
        <DropZone onFiles={handleFiles} maxMB={maxMB} aspectRatio="16/9" error={error} disabled={disabled} />
      )}
      <FieldMessage error={error} success={image ? "Image uploaded successfully" : undefined} />
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}

// ─────────────────────────────────────────────
// MultiImageUpload
// ─────────────────────────────────────────────
export function MultiImageUpload({ label = "Product Images", required = false, maxFiles = 8, maxMB = 4, cols = 3, value, onChange, error, disabled = false }) {
  const [internal, setInternal] = useState([]);
  const [coverIdx, setCoverIdx] = useState(0);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const inputRef = useRef(null);

  const isControlled = value !== undefined;
  const images = isControlled ? value.map((f) => ({ file: f, url: URL.createObjectURL(f) })) : internal;

  const setImages = (updater) => {
    const next = typeof updater === "function" ? updater(images) : updater;
    if (!isControlled) setInternal(next);
    onChange?.(next.map((x) => x.file));
  };

  const addFiles = (files) => {
    if (disabled) return;
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/") && f.size <= maxMB * 1024 * 1024).map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...valid].slice(0, maxFiles));
  };

  const remove = (i) => {
    setImages((prev) => prev.filter((_, j) => j !== i));
    if (coverIdx >= i && coverIdx > 0) setCoverIdx((c) => c - 1);
  };

  const handleReorderDrop = (toIdx) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    setImages((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr;
    });
    if (coverIdx === dragIdx) setCoverIdx(toIdx);
    else if (coverIdx === toIdx) setCoverIdx(dragIdx);
    setDragIdx(null);
    setOverIdx(null);
  };

  const slots = [...images];
  while (slots.length < maxFiles) slots.push(null);

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel label={label} required={required} right={`${images.length} / ${maxFiles}`} />
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {slots.map((img, i) => (
          <ImageThumbnail
            key={i}
            image={img}
            isCover={i === coverIdx && img !== null}
            isDragOver={overIdx === i && img !== null}
            disabled={disabled}
            onRemove={() => remove(i)}
            onSetCover={() => setCoverIdx(i)}
            onAddClick={() => inputRef.current?.click()}
            dragProps={img ? {
              draggable: !disabled,
              onDragStart: () => setDragIdx(i),
              onDragOver: (e) => { e.preventDefault(); setOverIdx(i); },
              onDragLeave: () => setOverIdx(null),
              onDrop: (e) => { e.preventDefault(); handleReorderDrop(i); },
            } : {}}
          />
        ))}
      </div>
      <FieldMessage error={error} hint={`Drag to reorder · first image is cover · max ${maxMB} MB each`} />
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
    </div>
  );
}