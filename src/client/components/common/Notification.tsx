import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Info, Loader, TriangleAlert, XCircle } from 'lucide-react';

import { useEffect, useState } from 'react';

import { NotificationType } from '../../../types/client';

interface NotificationProps {
  type: NotificationType;
  title?: string;
  message?: string;
  hash?: string;
  duration?: number;
  onDismiss: () => void;
}

const Notification = ({
  type = NotificationType.Error,
  title = type.charAt(0) + type.slice(1).toLowerCase(),
  message,
  hash,
  duration = 2500,
  onDismiss,
}: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(), 500);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Pending:
      case NotificationType.InBlock:
        return <Loader className="w-6 h-6 animate-spin text-mf-edge-500" />;
      case NotificationType.Success:
        return <CheckCircle className="w-6 h-6 text-mf-sybil-500" />;
      case NotificationType.Info:
        return <Info className="w-6 h-6 text-mf-safety-500" />;
      case NotificationType.Error:
        return <XCircle className="w-6 h-6 text-mf-safety-500" />;
      case NotificationType.Warning:
        return <TriangleAlert className="w-6 h-6 text-mf-safety-500" />;
      default:
        return <Info className="w-6 h-6 text-mf-edge-500" />;
    }
  };

  const getMessageColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Pending:
      case NotificationType.InBlock:
        return 'text-mf-edge-500';
      case NotificationType.Success:
        return 'text-mf-sybil-500';
      case NotificationType.Info:
      case NotificationType.Error:
      case NotificationType.Warning:
        return 'text-mf-safety-500';
      default:
        return 'text-mf-edge-500';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
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
              <div className="flex items-center">{getIcon(type)}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
