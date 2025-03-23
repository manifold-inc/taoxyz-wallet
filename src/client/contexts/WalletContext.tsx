import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface WalletContextType {
  currentAddress: string | null;
  setCurrentAddress: (address: string | null) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async (): Promise<void> => {
    const result = await chrome.storage.local.get("currentAddress");
    setCurrentAddress(result.currentAddress);
  };

  const updateCurrentAddress = async (
    address: string | null
  ): Promise<void> => {
    await chrome.storage.local.set({ currentAddress: address });
    setCurrentAddress(address);
  };

  return (
    <WalletContext.Provider
      value={{ currentAddress, setCurrentAddress: updateCurrentAddress }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
