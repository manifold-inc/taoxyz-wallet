import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type NotificationType = "error" | "pending" | "inBlock" | "success";

interface NotificationProps {
  type: NotificationType;
  message: string;
  hash?: string;
  show?: boolean;
  autoHide?: boolean;
  onDismiss?: () => void;
}

const Notification = ({
  type = "error",
  message,
  hash,
  show = true,
  autoHide = true,
  onDismiss,
}: NotificationProps) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const [statusDetails, setStatusDetails] = useState<string>("");

  useEffect(() => {
    if (show) {
      setIsLeaving(false);
    }

    switch (type) {
      case "pending":
        setStatusDetails("Submitting transaction...");
        break;
      case "inBlock":
        setStatusDetails("Transaction in block...");
        break;
      case "success":
        setStatusDetails("Transaction successful!");
        break;
      case "error":
        setStatusDetails("An error occurred");
        break;
    }

    if (show && autoHide) {
      const startLeaveTimer = setTimeout(() => {
        setIsLeaving(true);
      }, 1700);

      const hideTimer = setTimeout(() => {
        onDismiss?.();
      }, 2000);

      return () => {
        clearTimeout(startLeaveTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [show, type, autoHide, onDismiss]);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-0 right-0 flex justify-center z-50">
      <div
        className={`
          bg-mf-ash-500 
          py-2
          px-4
          rounded-sm 
          shadow-lg
          transform
          transition-all
          duration-300
          ${isLeaving ? "animate-slideUp" : "animate-slideDown"}
          w-60
        `}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-start">
            <h2 className="text-xl font-semibold text-mf-silver-500">
              {type === "pending" || type === "inBlock"
                ? "Processing"
                : type === "success"
                ? "Success"
                : "Error"}
            </h2>
            <p className="text-xs text-mf-milk-500">{message}</p>
            <p className="text-xs text-mf-silver-300">{statusDetails}</p>
            {hash && (
              <p className="text-xs text-mf-milk-500 mt-1 font-mono">
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </p>
            )}
          </div>
          <div className="flex items-center">
            {type === "pending" || type === "inBlock" ? (
              <Loader2 className="w-5 h-5 animate-spin text-mf-silver-500" />
            ) : type === "success" ? (
              <CheckCircle className="w-5 h-5 text-mf-sybil-500" />
            ) : (
              <XCircle className="w-5 h-5 text-mf-safety-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
