import React, { useState } from 'react';

const JoiningDocuments = () => {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'adharPDF.pdf', uploaded: true },
    { id: 2, name: 'Pan Card.pdf', uploaded: true },
  ]);

  const handleRemove = (id) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newDocument = {
        id: documents.length + 1,
        name: file.name,
        uploaded: true,
      };
      setDocuments([...documents, newDocument]);
    }
  };

  return (
    <div className="joining-documents">
      <h3>Joining Documents</h3>
      <p>{documents.length} documents uploaded</p>

      <div className="document-list">
        {documents.map((doc) => (
          <div key={doc.id} className="document-item">
            <div className="document-icon">
              {/* Add your document icon */}
            </div>
            <div className="document-details">
              <span>{doc.name}</span>
              {doc.uploaded && (
                <>
                  <span className="uploaded-text">Uploaded</span>
                  <button onClick={() => handleRemove(doc.id)}>Remove</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="upload-section">
        <label htmlFor="fileUpload">
          <span className="upload-icon">+</span>
          <span>Upload new document</span>
        </label>
        <input
          type="file"
          id="fileUpload"
          accept=".pdf"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default JoiningDocuments;