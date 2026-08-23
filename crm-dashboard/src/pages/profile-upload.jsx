import ProfileImageUpload from "../formComponents/ProfileImageUpload";
import MultipleFileInput from "../components/ui/MultipleFileInput";

import { useState, } from "react";

// Gallery Component
function MultiImageUpload() {
  const [images, setImages] = useState([]);

  const handleUpload = (e) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = [];
    for (let i = 0; i < files.length; i++) {
      newImages.push(URL.createObjectURL(files[i]));
    }

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-xl bg-white border rounded-xl p-4 shadow-sm">
      <p className="text-sm font-medium text-gray-700 mb-3">
        Product Images
      </p>

      {/* Upload Box */}
      <label className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50">
        <span>➕ Add Images</span>
        <input type="file" multiple onChange={handleUpload} className="hidden" />
      </label>

      {/* Preview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {images.map((img, index) => (
          <div key={index} className="relative">
            <img
              src={img}
              alt="preview"
              className="w-full h-24 object-cover rounded-md border"
            />

            <button
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            {index === 0 && (
              <span className="absolute bottom-1 left-1 text-[10px] bg-black text-white px-1 rounded">
                Cover
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Page
export default function ImageUploadDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 ">
      <h1 className="text-xl font-semibold mb-6">
        {/* Image Upload Components */}
      </h1>

      <div className="flex flex-col gap-6 bg-white">
        <ProfileImageUpload />
        {/* <MultiImageUpload /> */}
          </div>
          <div className="flex flex-col gap-6 bg-white mt-5">
        {/* <MultipleFileInput /> */}
        {/* <MultiImageUpload /> */}
          </div>
          
          
    </div>
  );
}