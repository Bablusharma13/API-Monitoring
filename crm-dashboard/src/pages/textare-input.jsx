"use client";

import React, { useState } from "react";
import CustomTextarea from "../formComponents/TextEditor";

export default function Sample() {
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleQuillChange = (val) => {
    setDescription(val);

    // simple validation
    if (!val || val === "<p><br></p>") {
      setError("Description is required");
    } else {
      setError("");
    }
  };

  return (
    <div
    className="max-w-xl mx-auto mt-6 p-8 bg-white rounded-xl"

  >

     <CustomTextarea
  label="Description"
  value=""
  onChange={(val) =>
    setFormData((prev) => ({ ...prev, description: val }))
  }
  error=""
  required
/>
    </div>
  );
}