import { useState, useRef } from "react";
import DropZone from "./DropZone";
import FieldLabel from "./FieldLabel";
import FieldMessage from "./FieldMessage";
import { formatSize } from "./utils";

/**
 * SingleImageUpload
 *
 * Props:
 *   label       string                      default: "Cover Image"
 *   required    boolean                     default: false
 *   maxMB       number                      default: 4
 *   value       File | null                 controlled (optional)
 *   onChange    (file: File | null) => void
 *   error       string
 *   disabled    boolean                     default: false
 */
export default function SingleImageUpload({
  label = "Cover Image",
  required = false,
  maxMB = 4,
  value,
  onChange,
  error,
  disabled = false,
}) {
  const [internal, setInternal] = useState(null); // { file, url }
  const inputRef = useRef(null);

  const isControlled = value !== undefined;
  const image = isControlled
    ? value
      ? { file: value, url: URL.createObjectURL(value) }
      : null
    : internal;

  const setImage = (img) => {
    if (!isControlled) setInternal(img);
    onChange?.(img?.file ?? null);
  };

  const handleFiles = (files) => {
    if (disabled) return;
    const file = Array.from(files).find(
      (f) => f.type.startsWith("image/") && f.size <= maxMB * 1024 * 1024
    );
    if (!file) return;
    setImage({ file, url: URL.createObjectURL(file) });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel label={label} required={required} />

      {image ? (
        /* ── Preview ── */
        <div
          className="relative w-full rounded-xl overflow-hidden border border-gray-100"
          style={{ aspectRatio: "16/9" }}
        >
          <img src={image.url} alt="preview" className="w-full h-full object-cover" />

          {/* Bottom bar */}
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2 bg-black/55">
            <span className="text-white text-xs truncate max-w-[55%]">
              {image.file.name} · {formatSize(image.file.size)}
            </span>
            <div className="flex gap-2 shrink-0">
              <button
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className="px-2.5 py-1 text-xs rounded-md bg-white/15 text-white border border-white/25 hover:bg-white/25 transition-colors disabled:opacity-40"
              >
                Replace
              </button>
              <button
                disabled={disabled}
                onClick={() => setImage(null)}
                className="px-2.5 py-1 text-xs rounded-md bg-white/15 text-white border border-white/25 hover:bg-red-500/70 transition-colors disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <DropZone
          onFiles={handleFiles}
          maxMB={maxMB}
          aspectRatio="16/9"
          error={error}
          disabled={disabled}
        />
      )}

      <FieldMessage
        error={error}
        success={image ? "Image uploaded successfully" : undefined}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}