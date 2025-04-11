import { createContext, useCallback, useContext, useState } from 'react';

import { NotificationType } from '../../types/client';
import Notification from '../components/common/Notification';

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
    }

    let defaultMessage = '';
    switch (params.type) {
      case NotificationType.Pending:
        defaultMessage = 'Transaction submitted to network';
        break;
      case NotificationType.InBlock:
        defaultMessage = 'Transaction included in block';
        break;
      case NotificationType.Success:
        defaultMessage = 'Transaction finalized';
        break;
      case NotificationType.Error:
        defaultMessage = 'Transaction failed';
        break;
    }

    const notification = {
      ...params,
      title: params.title || defaultTitle,
      message: params.message || defaultMessage,
      duration: params.duration || 2500,
    };

    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      dismissNotification(notification);
    }, notification.duration + 500);
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
