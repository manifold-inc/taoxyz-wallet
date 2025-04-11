import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Info, Loader, XCircle } from 'lucide-react';

import { useEffect } from 'react';

import { NotificationType } from '../../../types/client';

interface NotificationProps {
  type: NotificationType;
  title?: string;
  message: string;
  hash?: string;
  show?: boolean;
  autoHide?: boolean;
  onDismiss?: () => void;
}

const Notification = ({
  type = NotificationType.Error,
  title = type.charAt(0) + type.slice(1).toLowerCase(),
  message,
  hash,
  show = true,
  autoHide = true,
  onDismiss,
}: NotificationProps) => {
  useEffect(() => {
    if (show && autoHide) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, autoHide, onDismiss]);

  const getMessageColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Pending:
      case NotificationType.InBlock:
        return 'text-mf-edge-500';
      case NotificationType.Success:
        return 'text-mf-sybil-500';
      case NotificationType.Info:
      case NotificationType.Error:
        return 'text-mf-safety-500';
      default:
        return 'text-mf-edge-500';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 left-0 right-0 flex justify-center z-50"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 25, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
          }}
        >
          <motion.div className="w-full mx-10 bg-mf-ash-500 px-4 py-3 rounded-sm shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-start">
                {/* Message Title */}
                <p className="text-xs text-mf-edge-500">{title}</p>

                {/* Message */}
                <p className={`text-xs ${getMessageColor(type)}`}>{message}</p>

                {/* Hash */}
                {hash && (
                  <p className="text-xs text-mf-milk-500 mt-1 font-mono">
                    {hash.slice(0, 10)}...{hash.slice(-8)}
                  </p>
                )}
              </div>

              {/* Icon */}
              <div className="flex items-center">
                {type === NotificationType.Pending || type === NotificationType.InBlock ? (
                  <Loader className="w-6 h-6 animate-spin text-mf-edge-500" />
                ) : type === NotificationType.Success ? (
                  <CheckCircle className="w-6 h-6 text-mf-sybil-500" />
                ) : type === NotificationType.Info ? (
                  <Info className="w-6 h-6 text-mf-safety-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-mf-safety-500" />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
