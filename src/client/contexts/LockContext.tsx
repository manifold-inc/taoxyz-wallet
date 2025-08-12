import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface LockContextType {
  isLocked: boolean;
  setIsLocked: (locked: boolean) => Promise<void>;
}

const LockContext = createContext<LockContextType | undefined>(undefined);

export const LockProvider = ({ children }: { children: ReactNode }) => {
  const [isLocked, setIsLocked] = useState(false);

  const init = async (): Promise<void> => {
    const lockResult = await chrome.storage.local.get('walletLocked');
    setIsLocked(lockResult.walletLocked === true);
  };

  const updateIsLocked = async (isLocked: boolean): Promise<void> => {
    try {
      console.log('🔓 [LockContext] Setting walletLocked to:', isLocked);
      console.log('🔓 [LockContext] Current state before update:', isLocked);

      await chrome.storage.local.set({ walletLocked: isLocked });
      console.log('✅ [LockContext] Storage updated successfully');

      setIsLocked(isLocked);
      console.log('✅ [LockContext] State updated successfully');
      console.log('🔓 [LockContext] New state after update:', isLocked);
    } catch (error) {
      console.error('💥 [LockContext] Failed to update storage:', error);
      throw error;
    }
  };

  init();

  return (
    <LockContext.Provider value={{ isLocked, setIsLocked: updateIsLocked }}>
      {children}
    </LockContext.Provider>
  );
};

export const useLock = () => {
  const context = useContext(LockContext);
  if (context === undefined) {
    throw new Error('useLock must be used within a LockProvider');
  }
  return context;
};
