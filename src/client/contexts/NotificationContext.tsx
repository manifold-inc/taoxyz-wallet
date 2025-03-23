import { createContext, useContext, useState, useCallback } from "react";

import Notification from "../components/Notification";
import { NotificationType } from "../../types/client";

interface NotificationContextType {
  showNotification: (params: ShowNotificationParams) => void;
  clearNotification: () => void;
}

interface ShowNotificationParams {
  type: NotificationType;
  message?: string;
  hash?: string;
  autoHide?: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notification, setNotification] = useState<
    ShowNotificationParams & { show: boolean; message: string }
  >({
    show: false,
    message: "",
    type: NotificationType.Error,
  });

  const showNotification = useCallback((params: ShowNotificationParams) => {
    let defaultMessage = "";
    switch (params.type) {
      case NotificationType.Pending:
        defaultMessage = "Transaction submitted to network";
        break;
      case NotificationType.InBlock:
        defaultMessage = "Transaction included in block";
        break;
      case NotificationType.Success:
        defaultMessage = "Transaction finalized";
        break;
      case NotificationType.Error:
        defaultMessage = "Transaction failed";
        break;
    }

    const shouldAutoHide =
      params.autoHide ??
      (params.type === NotificationType.Success ||
        params.type === NotificationType.Error);

    setNotification({
      ...params,
      show: true,
      message: params.message || defaultMessage,
      autoHide: shouldAutoHide,
    });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, show: false }));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showNotification, clearNotification }}
    >
      {children}
      <Notification {...notification} onDismiss={clearNotification} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
