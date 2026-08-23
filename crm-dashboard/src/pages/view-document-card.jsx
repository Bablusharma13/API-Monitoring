import React, { useState, useRef, useEffect } from 'react';

const badgeColors = ['bg-blue-600', 'bg-purple-600', 'bg-cyan-600', 'bg-emerald-600', 'bg-red-600', 'bg-amber-600'];

const FileIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
);

const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const CheckIcon = () => (
  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
    <polyline
      points="2,6 5,9 10,3"
      stroke="#16a34a"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DocumentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      stroke="#d97706"
      strokeWidth="1.8"
      fill="none"
      strokeLinejoin="round"
    />
    <polyline
      points="14 2 14 8 20 8"
      stroke="#d97706"
      strokeWidth="1.8"
      fill="none"
      strokeLinejoin="round"
    />
  </svg>
);

const JoiningDocuments = () => {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'adharPDF.pdf', label: 'Aadhaar Card', colorClass: 'bg-blue-600' },
    { id: 2, name: 'Pan Card.pdf', label: 'PAN Card', colorClass: 'bg-purple-600' },
  ]);

  const nextId = useRef(3);
  const fileInputRef = useRef(null);

  const handleRemove = (id) =>
    setDocuments(prev => prev.filter(d => d.id !== id));

  const handleUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const colorClass = badgeColors[nextId.current % badgeColors.length];
      const label = file.name.replace(/\.[^.]+$/, '').slice(0, 14);
      const preview = URL.createObjectURL(file);

      setDocuments(prev => [
        ...prev,
        {
          id: nextId.current++,
          name: file.name,
          label,
          colorClass,
          fileType: file.type,
          preview,
        },
      ]);

      e.target.value = '';
    }
  };

  // Cleanup previews
  useEffect(() => {
    return () => {
      documents.forEach(doc => {
        if (doc.preview) URL.revokeObjectURL(doc.preview);
      });
    };
  }, [documents]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center ">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
            <DocumentIcon />
          </div>
          <div>
            <p className="text-sm text-[#1c1f2e]">Joining Documents</p>
            <p className="text-xs text-[#6b7280] mt-0.5">
              {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current.click()}
          className="flex items-center gap-1.5 px-2.5 py-2 text-xs text-[#6b7280] bg-white border border-[#e9ebf0] rounded-lg hover:bg-[#eff4ff] hover:border-blue-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          + Upload Document
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.png"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* Card Grid */}
      <div className="flex flex-wrap gap-3.5">

        {documents.map(doc => (
          <div
            key={doc.id}
            className="w-90 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0"
          >
            {/* Preview */}
            <div className="bg-[#0f1123] h-32 flex items-center justify-center relative overflow-hidden">
              <span className={`absolute top-2.5 left-2.5 ${doc.colorClass} text-white text-xs px-2.5 py-1 rounded-sm`}>
                {doc.label}
              </span>

              {/* Preview Logic */}
              {doc.fileType?.startsWith("image/") ? (
                <img
                  src={doc.preview}
                  alt={doc.name}
                  className="w-full h-full object-cover"
                />
              ) : doc.fileType === "application/pdf" ? (
                <iframe
                  src={doc.preview}
                  title={doc.name}
                  className="w-full h-full"
                />
              ) : (
                <FileIcon />
              )}
            </div>

            {/* Footer */}
            <div className="p-3">
              <p className="text-xs font-medium text-[#1c1f2e] font-mono truncate mb-2.5">
                {doc.name}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center">
                    <CheckIcon />
                  </div>
                  <span className="text-xs text-[#16a34a]">Uploaded</span>
                </div>
                <button
                  onClick={() => handleRemove(doc.id)}
                  className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-1.5 py-1 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Upload Card */}
        <div
          onClick={() => fileInputRef.current.click()}
          className="w-90 h-[216px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:border-blue-600 transition-colors shrink-0"
        >
          <UploadIcon />
          <span className="text-xs text-gray-400">Upload new document</span>
        </div>

      </div>
    </div>
  );
};

export default JoiningDocuments;