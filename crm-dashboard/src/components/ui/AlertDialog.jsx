import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";

const TYPE_CONFIG = {
  danger: {
    iconBg: "bg-red-50",
    iconBorder: "border-red-100",
    iconStroke: "#DC2626",
    iconPath: (
      <>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
    checkBg: "bg-[#2563EB] border-[#2563EB]",
    checkIdle: "bg-white border-amber-400",
    confirmBg: "bg-orange-50 border-orange-200",
    confirmTxt: "text-amber-800",
    btnBase: "bg-[#DC2626] hover:bg-[#B91C1C]",
    btnOff: "bg-[#DC2626] opacity-45",
  },
  warning: {
    iconBg: "bg-amber-50",
    iconBorder: "border-amber-100",
    iconStroke: "#D97706",
    iconPath: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </>
    ),
    checkBg: "bg-amber-500 border-amber-500",
    checkIdle: "bg-white border-amber-400",
    confirmBg: "bg-amber-50 border-amber-200",
    confirmTxt: "text-amber-800",
    btnBase: "bg-amber-500 hover:bg-amber-600",
    btnOff: "bg-amber-500 opacity-45",
  },
  success: {
    iconBg: "bg-green-50",
    iconBorder: "border-green-100",
    iconStroke: "#16A34A",
    iconPath: (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    ),
    checkBg: "bg-green-600 border-green-600",
    checkIdle: "bg-white border-green-400",
    confirmBg: "bg-green-50 border-green-200",
    confirmTxt: "text-green-800",
    btnBase: "bg-green-600 hover:bg-green-700",
    btnOff: "bg-green-600 opacity-45",
  },
  info: {
    iconBg: "bg-[#EFF4FF]",
    iconBorder: "border-blue-100",
    iconStroke: "#2563EB",
    iconPath: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </>
    ),
    checkBg: "bg-[#2563EB] border-[#2563EB]",
    checkIdle: "bg-white border-blue-300",
    confirmBg: "bg-[#EFF4FF] border-blue-100",
    confirmTxt: "text-blue-800",
    btnBase: "bg-[#2563EB] hover:bg-[#1D4ED8]",
    btnOff: "bg-[#2563EB] opacity-45",
  },
};

function ModalBackdrop() {
  return (
    <DialogBackdrop
      transition
      className="fixed inset-0 transition-opacity
        data-[closed]:opacity-0 data-[enter]:duration-200 data-[enter]:ease-out
        data-[leave]:duration-150 data-[leave]:ease-in"
      style={{ background: "rgba(15,18,35,.48)", backdropFilter: "blur(2px)" }}
    />
  );
}

export const AlertDialog = ({
  open,
  setOpen,
  title,
  description,
  checkboxLabel,
  handleOnClick,
  itemName,
  isLoading = false,
  type = "danger",
}) => {
  const [checked, setChecked] = useState(false);

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.danger;

  const handleClose = () => {
    setChecked(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <ModalBackdrop />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-2">
          <DialogPanel
            transition
            className="relative w-full max-w-xs bg-white rounded-xl shadow-xl overflow-hidden transition-all
              data-[closed]:opacity-0 data-[closed]:translate-y-3 data-[closed]:scale-[.98]
              data-[enter]:duration-200 data-[enter]:ease-out
              data-[leave]:duration-150 data-[leave]:ease-in"
          >
            <div className="flex justify-end px-5 pt-5">
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="px-4 pb-4 flex flex-col items-center">
              <div
                className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 ${cfg.iconBg} ${cfg.iconBorder}`}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={cfg.iconStroke}
                  strokeWidth="2"
                >
                  {cfg.iconPath}
                </svg>
              </div>

              <DialogTitle
                as="h2"
                className="text-[16px] text-[#0F1929] text-center mb-2"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {title}
              </DialogTitle>

              <p className="text-[13px] text-gray-500 text-center leading-relaxed mb-5">
                {description}
              </p>

              <div
                onClick={() => setChecked((c) => !c)}
                className={`flex items-start gap-3 w-full p-3 rounded-xl border cursor-pointer
                  hover:opacity-90 transition-opacity mb-1 ${cfg.confirmBg}`}
              >
                <input
                  id="comments"
                  name="comments"
                  type="checkbox"
                  aria-describedby="comments-description"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="sr-only"
                />
                <div
                  aria-hidden="true"
                  className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center
                    flex-shrink-0 mt-0.5 transition-all
                    ${checked ? cfg.checkBg : cfg.checkIdle}`}
                >
                  {checked && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <p
                  id="comments-description"
                  className={`text-[12.5px] leading-[1.55] select-none ${cfg.confirmTxt}`}
                >
                  {checkboxLabel ?? description}
                </p>
              </div>

              <div className="flex gap-2 w-full mt-2">
                <button
                  type="button"
                  disabled={!checked || isLoading}
                  onClick={handleOnClick}
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  className={`w-full flex items-center justify-center gap-1.5 px-5 py-2
                    text-xs font-medium text-white rounded-lg transition-all
                    ${
                      !checked || isLoading
                        ? cfg.btnOff + " cursor-not-allowed"
                        : cfg.btnBase + " active:translate-y-px cursor-pointer"
                    }`}
                >
                  {isLoading && (
                    <svg
                      className="animate-spin"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                  )}
                  {itemName}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  className="w-full flex items-center justify-center px-5 py-2
                    text-xs font-medium text-gray-700 bg-white border border-[#E2E6ED]
                    rounded-lg hover:bg-gray-50 active:translate-y-px transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};
