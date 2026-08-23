import React, { useState } from "react";
import FileUpload from "../components/ui/FileUpload";

const ProfileDocumentsSection = () => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("default");
  const [progress, setProgress] = useState(0);

  const handleFilesChange = (nextFiles) => {
    setFiles(nextFiles);
    setStatus(nextFiles.length ? "selected" : "default");
  };

  return (
    
<div>
    
    <FileUpload
      label="Supporting documents"
      description="Upload PDFs or images up to 10 MB."
      multiple
      accept="image/*,.pdf"
      files={files}
      onFilesChange={handleFilesChange}
      status={status}
      progress={progress}
    />
    </div>
  );
};

export default ProfileDocumentsSection;