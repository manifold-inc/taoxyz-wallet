import { useEffect } from "react";

interface NotificationProps {
  message: string;
  show: boolean;
  onDismiss: () => void;
}

const Notification = ({
  message = "Error",
  show = true,
  onDismiss,
}: NotificationProps) => {
  useEffect(() => {
    if (show && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

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
        animate-slideDown
      `}
      >
        <div className="flex items-center justify-between gap-14 w-60">
          <div className="flex flex-col items-start">
            <h2 className="text-xl font-semibold text-mf-silver-500">Error</h2>
            <p className="text-xs text-mf-milk-500">{message}</p>
          </div>
          <div className="loader w-5 h-5 p-2" />
        </div>
      </div>
    </div>
  );
};

export default Notification;
