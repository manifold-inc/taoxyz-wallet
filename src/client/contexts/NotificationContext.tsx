import { createContext, useContext, useState, useCallback } from "react";
import Notification from "../components/Notification";

interface NotificationContextType {
  showNotification: (params: ShowNotificationParams) => void;
  clearNotification: () => void;
}

interface ShowNotificationParams {
  message: string;
  type: "error" | "pending" | "inBlock" | "success";
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
    ShowNotificationParams & { show: boolean }
  >({
    show: false,
    message: "",
    type: "error",
  });

  const showNotification = useCallback((params: ShowNotificationParams) => {
    setNotification({ ...params, show: true });
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
