import { useMemo, useState } from "react";
import FormModal from "./FormModal";

function isApiTestModalProps(props) {
  return (
    props.method !== undefined ||
    props.url !== undefined ||
    props.initialBody !== undefined
  );
}

/** Generic dialog — used across dashboards (open/isOpen, title, footer, children). */
export function AppDialog({
  open,
  isOpen,
  onClose,
  title,
  subtitle,
  footer,
  children,
  size,
  wide,
  zIndex,
}) {
  const visible = open ?? isOpen ?? false;
  return (
    <FormModal
      open={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={footer}
      size={wide ? "wide" : size || "lg"}
      zIndex={zIndex}
    >
      {children}
    </FormModal>
  );
}

export function ApiTestModal({
  isOpen,
  onClose,
  method = "POST",
  url = "",
  initialBody = '{\n  "amount": 1000,\n  "currency": "USD"\n}',
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [body, setBody] = useState(initialBody);

  const responseText = useMemo(
    () => `HTTP 503 Service Unavailable
Timestamp: ${new Date().toUTCString()}
Upstream: connection refused

{
  "error": "service_unavailable",
  "message": "Upstream server is not responding",
  "code": 503,
  "retry_after": 30
}`,
    [],
  );

  const runTest = () => {
    setIsRunning(true);
    setShowResult(false);
    setTimeout(() => {
      setIsRunning(false);
      setShowResult(true);
    }, 1200);
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title="Test API"
      size="md"
      zIndex={1200}
      footer={
        <>
          <button type="button" className="form-modal-btn" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="form-modal-btn form-modal-btn-primary"
            onClick={runTest}
            disabled={isRunning}
          >
            {isRunning ? "Sending..." : "Send Request"}
          </button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-[#f8f9fc] dark:bg-white/5">
          <span className="badge b-blue text-[10px] font-mono">{method}</span>
          <span className="text-[12px] text-gray-500 dark:text-stone-400 font-mono truncate">
            {url || "https://api.example.com/v1/endpoint"}
          </span>
        </div>

        <div>
          <div className="text-[12px] text-gray-500 dark:text-stone-400 mb-1.5">
            Request Body
          </div>
          <textarea
            className="w-full min-h-[130px] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-[12px] font-mono outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] bg-white dark:bg-black/20 text-gray-900 dark:text-stone-100"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        {showResult && (
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-white/10 mb-2">
              <span className="badge b-red">503 Service Unavailable</span>
              <span className="text-[11px] text-gray-400 font-mono">0ms</span>
              <span className="text-[11px] text-gray-400 font-mono">Upstream down</span>
            </div>
            <pre className="bg-[#f8f9fc] dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-[12px] font-mono text-[#1c1f2e] dark:text-stone-100 whitespace-pre-wrap">
              {responseText}
            </pre>
          </div>
        )}
      </div>
    </FormModal>
  );
}

/** Default export: ApiTestModal when test props present, else AppDialog. */
export default function Modal(props) {
  if (isApiTestModalProps(props)) {
    return <ApiTestModal {...props} />;
  }
  return <AppDialog {...props} />;
}
