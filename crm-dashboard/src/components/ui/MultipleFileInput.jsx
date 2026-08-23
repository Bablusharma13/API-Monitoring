import React, { useRef } from "react";

// ... (keep the existing helper functions, icons, Badge, and ProgressBar components)
const IconUpload = () => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-3 3m3-3l3 3" />
  </svg>
);
// Multiple File Input
const MultipleFileInput = ({
  files = [],
  onChange,
  onRemove,
  onRetry,
  status = "default",
  progress = 0,
  disabled = false,
}) => {
  const fileInputRef = useRef(null);

  const handleBrowse = () => {
    if (!disabled) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length && onChange) onChange(selectedFiles);
  };

  return (
    <div className="space-y-2">
      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
        multiple
      />

      {/* Browse Button */}
      {files.length === 0 && (
        <button
          onClick={handleBrowse}
          disabled={disabled}
          className={`
            px-3 py-2 border rounded-md text-sm 
            ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}
          `}
        >
          <IconUpload className="w-4 h-4 mr-2" />
          Browse files
        </button>
      )}

      {/* File List */}
      {files.map((file, index) => (
        <div key={file.name} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="font-medium">{file.name}</div>
            <Badge text={file.name.split(".").pop()?.toUpperCase()} color="blue" />
            <div className="text-gray-500 text-sm">{formatFileSize(file.size)}</div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {status === "selected" && (
              <>
                <button onClick={() => onRemove(index)} className="hover:text-red-600">
                  <IconTrash />
                </button>
              </>
            )}

            {status === "uploading" && (
              <button onClick={() => {}} className="hover:text-red-600">
                <IconX />
              </button>
            )}

            {status === "success" && (
              <>
                <button className="hover:text-gray-700">
                  <IconDownload />
                </button>
                <button onClick={() => onRemove(index)} className="hover:text-red-600">
                  <IconTrash />
                </button>
              </>
            )}

            {status === "error" && (
              <>
                <button onClick={() => onRetry(index)} className="hover:text-blue-600">
                  <IconRefresh />
                </button>
                <button onClick={() => onRemove(index)} className="hover:text-red-600">
                  <IconTrash />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Progress Bar */}
      {(status === "uploading" || status === "success" || status === "error") && (
        <ProgressBar
          progress={progress}
          color={status === "success" ? "green" : status === "error" ? "red" : "blue"}
        />
      )}

      {/* Status Text */}
      {status !== "default" && (
        <div
          className={`
          text-sm 
          ${
            status === "error"
              ? "text-red-600"
              : status === "success"
              ? "text-green-600"
              : "text-gray-500"
          }
        `}
        >
          {status === "selected" && "Files ready to upload"}
          {status === "uploading" && `Uploading... ${progress}%`}
          {status === "success" && "Uploaded successfully"}
          {status === "error" && "Upload failed. Please try again."}
        </div>
      )}
    </div>
  );
};

export default MultipleFileInput;