import { CheckCircle, Loader, XCircle } from 'lucide-react';

import { useEffect, useState } from 'react';

import { NotificationType } from '../../../types/client';

interface NotificationProps {
  type: NotificationType;
  message: string;
  hash?: string;
  show?: boolean;
  autoHide?: boolean;
  onDismiss?: () => void;
}

const Notification = ({
  type = NotificationType.Error,
  message,
  hash,
  show = true,
  autoHide = true,
  onDismiss,
}: NotificationProps) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (show) setIsLeaving(false);

    if (show && autoHide) {
      const startLeaveTimer = setTimeout(() => {
        setIsLeaving(true);
      }, 1700);

      const hideTimer = setTimeout(() => {
        onDismiss?.();
      }, 2100);

      return () => {
        clearTimeout(startLeaveTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [show, autoHide, onDismiss]);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-0 right-0 flex justify-center z-50">
      <div
        className={`
          w-72
          bg-mf-ash-500 
          py-2
          px-4
          rounded-sm 
          shadow-lg
          transform
          transition-all
          duration-500
          ${isLeaving ? 'animate-slideUp' : 'animate-slideDown'}
        `}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-start">
            <h2 className="text-xl font-semibold text-mf-edge-500">
              {type === NotificationType.Pending || type === NotificationType.InBlock
                ? 'Processing'
                : type === NotificationType.Success
                  ? 'Success'
                  : 'Error'}
            </h2>
            <p className="text-xs text-mf-milk-500">{message}</p>
            {hash && (
              <p className="text-xs text-mf-milk-500 mt-1 font-mono">
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </p>
            )}
          </div>
          <div className="flex items-center">
            {type === NotificationType.Pending || type === NotificationType.InBlock ? (
              <Loader className="w-6 h-6 animate-spin text-mf-edge-500" />
            ) : type === NotificationType.Success ? (
              <CheckCircle className="w-6 h-6 text-mf-sybil-500" />
            ) : (
              <XCircle className="w-6 h-6 text-mf-safety-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
