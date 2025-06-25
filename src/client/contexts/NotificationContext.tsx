import { createContext, useCallback, useContext, useState } from 'react';

import Notification from '@/client/components/common/Notification';
import { NotificationType } from '@/types/client';

interface NotificationContextType {
  showNotification: (params: Notification) => void;
  dismissNotification: (notification: Notification) => void;
}

interface Notification {
  type: NotificationType;
  title?: string;
  message?: string;
  hash?: string;
  duration?: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((params: Notification) => {
    let defaultTitle = '';
    switch (params.type) {
      case NotificationType.Pending:
        defaultTitle = 'Pending';
        break;
      case NotificationType.InBlock:
        defaultTitle = 'In Block';
        break;
      case NotificationType.Success:
        defaultTitle = 'Success';
        break;
      case NotificationType.Error:
        defaultTitle = 'Error';
        break;
      case NotificationType.Info:
        defaultTitle = 'Info';
        break;
      case NotificationType.Warning:
        defaultTitle = 'Warning';
        break;
      default:
        defaultTitle = 'Unknown';
        break;
    }

    let defaultMessage = '';
    switch (params.type) {
      case NotificationType.Pending:
        defaultMessage = 'Pending';
        break;
      case NotificationType.InBlock:
        defaultMessage = 'In Block';
        break;
      case NotificationType.Success:
        defaultMessage = 'Success';
        break;
      case NotificationType.Error:
        defaultMessage = 'Error';
        break;
      case NotificationType.Info:
        defaultMessage = 'Info';
        break;
      case NotificationType.Warning:
        defaultMessage = 'Warning';
        break;
      default:
        defaultMessage = 'Unknown';
        break;
    }

    const notification = {
      ...params,
      title: params.title || defaultTitle,
      message: params.message || defaultMessage,
      duration: params.duration || 2500,
    };

    setNotifications(prev => [...prev, notification]);
  }, []);

  const dismissNotification = useCallback((notification: Notification) => {
    setNotifications(prev => prev.filter(n => n !== notification));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, dismissNotification }}>
      {children}
      {notifications.map((notification, index) => (
        <Notification
          key={index}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          hash={notification.hash}
          duration={notification.duration}
          onDismiss={() => dismissNotification(notification)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
