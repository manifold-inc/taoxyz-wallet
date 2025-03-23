import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface LockContextType {
  isLocked: boolean;
  setIsLocked: (locked: boolean) => Promise<void>;
}

const LockContext = createContext<LockContextType | undefined>(undefined);

export const LockProvider = ({ children }: { children: ReactNode }) => {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async (): Promise<void> => {
    const lockResult = await chrome.storage.local.get("walletLocked");
    setIsLocked(lockResult.walletLocked === true);
  };

  const updateIsLocked = async (isLocked: boolean): Promise<void> => {
    await chrome.storage.local.set({ walletLocked: isLocked });
    setIsLocked(isLocked);
  };

  return (
    <LockContext.Provider value={{ isLocked, setIsLocked: updateIsLocked }}>
      {children}
    </LockContext.Provider>
  );
};

export const useLock = () => {
  const context = useContext(LockContext);
  if (context === undefined) {
    throw new Error("useLock must be used within a LockProvider");
  }
  return context;
};
