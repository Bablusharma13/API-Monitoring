import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        await axios.post(
          `${import.meta.env.VITE_CRM_BACKEND}/api/v1/auth/logout`,
          {},
          { withCredentials: true },
        );
      } catch (error) {
        console.error("Logout failed:", error);
      } finally {
        navigate("/login", { replace: true });
      }
    };

    logout();
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-white">
      {/* Spinner */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-medium text-gray-700">Signing you out…</p>
        <p className="text-xs text-gray-400">Please wait a moment</p>
      </div>
    </div>
  );
};
