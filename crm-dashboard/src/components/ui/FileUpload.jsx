import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, FileText, Trash2 } from "lucide-react";

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const inputRef = useRef();

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files);

    // limit 5 files
    const updated = [...files, ...selected].slice(0, 5);
    setFiles(updated);
  };

  const handleRemove = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (size) => {
    if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="w-5 h-5 text-purple-500" />;
    }
    return <FileText className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="">

      {/* Header */}
      <div className="flex justify-between mb-3">
        <span className="flex items-center gap-1 text-[#6b7280] text-[12.5px]">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="2"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>

          Attachments
        </span>
        <span className="text-[11.5px] text-[#6b7280]">
          {files.length} / 5 files
        </span>
      </div>

      {/* Upload Box */}
      <div
        onClick={() => inputRef.current.click()}
        className="border-2 bg-white border-dashed border-[#e9ebf0] rounded-xl p-[20px] text-center cursor-pointer hover:border-[#2563eb] hover:bg-[#eff4ff] transition"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="bg-[#f4f6fa] p-3 rounded-xl">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          </div>

          <p className="text-[#1c1f2e] text-[14px]">Add files</p>

          <p className="text-[12.5px] text-[#6b7280]">
            Drag here or{" "}
            <span className="text-blue-500 underline">browse</span>
          </p>
          <div className="flex flex-col items-center gap-2 mt-1">

<div className="flex flex-wrap justify-center gap-2 max-w-[220px]">
  {["pdf", "doc", "jpg", "png"].map((type) => (
    <span
      key={type}
      className="px-3 py-1 bg-[#f0f2f7] text-[11px] text-[#6b7280] rounded-md"
    >
      {type}
    </span>
  ))}
</div>

<p className="text-[12px] text-[#6b7280] font-[300]">
  max 10 MB each · 5 files
</p>

</div>

        </div>
      </div>

      {/* File List */}
      {/* File List */}
<div className="mt-4 space-y-3">
  {files.map((item, index) => {
    const file = item.file || item; // support old + new structure
    const status = item.status || "done";
    const progress = item.progress || 0;

    const getBorder = () => {
      if (status === "done") return "border-[#22c55e]";
      if (status === "failed") return "border-[#ef4444]";
      if (status === "uploading") return "border-[#3b82f6]";
      return "border-[#e9ebf0]";
    };

    const getBg = () => {
      if (status === "done") return "bg-[#f0fdf4]";
      if (status === "failed") return "bg-[#fef2f2]";
      if (status === "uploading") return "bg-[#eff6ff]";
      return "bg-white";
    };

    return (
      <div
        key={index}
        className={`rounded-xl p-[12px] border ${getBorder()} ${getBg()}`}
      >
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <div className="bg-[#f4f6fa] p-2 rounded-lg">
              {getFileIcon(file)}
            </div>

            <div>
              <p className="text-[13px] text-[#1c1f2e] font-[400] truncate max-w-[180px]">
                {file.name}
              </p>

              <div className="flex items-center gap-2 text-[11.5px] text-[#6b7280] font-[400]">
                <span>{formatFileSize(file.size)}</span>

                <span className="px-2 py-[2px] bg-[#eef2f7] rounded-full text-[10.5px]">
                  {file.type?.split("/")[1]?.toUpperCase()}
                </span>

                {/* STATUS BADGE */}
                {status === "done" && (
                  <span className="px-2 py-[2px] text-[10.5px] bg-[#dcfce7] text-[#16a34a] rounded-full">
                    Done
                  </span>
                )}

                {status === "failed" && (
                  <span className="px-2 py-[2px] text-[10.5px] bg-[#fee2e2] text-[#dc2626] rounded-full">
                    Failed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">
            {status === "failed" && (
              <button onClick={() => handleRetry(index)}>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                >
                  <path d="M1 4v6h6"></path>
                  <path d="M23 20v-6h-6"></path>
                </svg>
              </button>
            )}

            <button onClick={() => handleRemove(index)}>
              <Trash2 className="w-4 h-4 text-[#6b7280] hover:text-[#ef4444]" />
            </button>
          </div>
        </div>

        {/* PROGRESS BAR */}
        {status === "uploading" && (
          <div className="mt-2">
            <div className="h-[4px] bg-[#e5e7eb] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3b82f6] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] text-[#3b82f6] mt-1 text-right">
              {progress}%
            </p>
          </div>
        )}
      </div>
    );
  })}
</div>

      {/* Error */}
      {files.length >= 5 && (
        <p className="text-red-500 text-sm mt-2">
          Maximum 5 files reached
        </p>
      )}

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.jpg,.jpeg,.png"
        onChange={handleFilesChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;