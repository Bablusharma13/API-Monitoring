import React, { useState } from "react";
import CustomPhoneInput from "../formComponents/CustomPhoneInput";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import CountrySelect from "../formComponents/CountrySelect";
export default function CareerForm({ jobId, jobTitle, jobType }) {
  const navigate = useNavigate();

  
  const [formData, setFormData] = useState({
    name_title: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "", // ✅ add this
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const UserIcon = () => (
    <svg
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );

 

  return (
    <>
      <Toaster position="top-right" />

        {/* Phone Input */}
        <div
        className="max-w-xl mx-auto mt-6 p-8 bg-white rounded-xl"

      >

          <CustomPhoneInput
                  label="Phone"
                  icon={<UserIcon />} 
            value={formData.phone}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, phone: value }));
              if (errors.phone) {
                setErrors((prev) => ({ ...prev, phone: "" }));
              }
            }}
            required
          />

          {errors.phone && (
            <p className="text-red-600 text-sm">
              {errors.phone}
            </p>
          )}
        </div>

        <div className="max-w-xl mx-auto mt-6 p-8 bg-white rounded-xl">


{/* Country Select */}
<div className="mt-5">
  <CountrySelect
    label="Country"
    required
    error={errors.country}
    success={formData.country ? "Selected" : ""}
    onChange={(country) => {
      setFormData((prev) => ({ ...prev, country }));
      if (errors.country) {
        setErrors((prev) => ({ ...prev, country: "" }));
      }
    }}
  />
</div>

{/* Error message (optional if you want external control) */}
{errors.country && (
  <p className="text-red-600 text-sm mt-1">
    {errors.country}
  </p>
)}

</div>
    </>
  );
}