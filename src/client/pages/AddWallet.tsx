import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { KeyringPair } from "@polkadot/keyring/types";

import { useNotification } from "../contexts/NotificationContext";
import { useWallet } from "../contexts/WalletContext";
import { useLock } from "../contexts/LockContext";
import MessageService from "../services/MessageService";
import CreateWallet from "../components/addWallet/CreateWallet";
import ImportWallet from "../components/addWallet/ImportWallet";
import MnemonicDisplay from "../components/addWallet/MnemonicDisplay";
import MnemonicImport from "../components/addWallet/MnemonicImport";
import { NotificationType } from "../../types/client";
import taoxyz from "../../../public/icons/taoxyz.svg";

type WalletMode =
  | "select"
  | "create-wallet"
  | "import-wallet"
  | "display-mnemonic"
  | "import-mnemonic";

interface AddWalletState {
  mode: WalletMode;
}

const AddWallet = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const { setIsLocked } = useLock();
  const { setCurrentAddress } = useWallet();
  const [mode, setMode] = useState<WalletMode>(
    (location.state as AddWalletState)?.mode
  );
  const [mnemonic, setMnemonic] = useState<string>("");
  const [wallet, setWallet] = useState<KeyringPair | null>(null);

  const handleImportMnemonic = (mnemonic: string) => {
    setMnemonic(mnemonic);
    setMode("import-wallet");
  };

  const handleCreateWalletSuccess = async (
    wallet: KeyringPair,
    mnemonic: string
  ): Promise<void> => {
    setMnemonic(mnemonic);
    setWallet(wallet);
    setMode("display-mnemonic");
  };

  const handleContinue = async (wallet: KeyringPair): Promise<void> => {
    if (!wallet) {
      showNotification({
        type: NotificationType.Error,
        message: "Could Not Find Wallet",
      });
      return;
    }

    await setCurrentAddress(wallet.address);
    await setIsLocked(false);
    await MessageService.sendClearLockTimer();
    navigate("/dashboard");
  };

  const getTitle = () => {
    switch (mode) {
      case "create-wallet":
        return "Create Wallet";
      case "import-wallet":
      case "import-mnemonic":
        return "Import Wallet";
      case "display-mnemonic":
        return "Save Recovery Phrase";
      default:
        return "Add Wallet";
    }
  };

  const renderContent = () => {
    switch (mode) {
      case "create-wallet":
        return (
          <CreateWallet
            onSuccess={handleCreateWalletSuccess}
            onBack={() => navigate("/welcome")}
          />
        );

      case "import-wallet":
        return <ImportWallet onSuccess={handleContinue} mnemonic={mnemonic} />;

      case "display-mnemonic":
        if (!wallet) {
          showNotification({
            type: NotificationType.Error,
            message: "Wallet not found",
          });
          return null;
        }
        return (
          <MnemonicDisplay
            mnemonic={mnemonic}
            onContinue={handleContinue}
            wallet={wallet}
          />
        );

      case "import-mnemonic":
        return (
          <MnemonicImport
            onContinue={handleImportMnemonic}
            onBack={() => navigate("/welcome")}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16 mt-24" />

      <div>
        <div className="text-center text-lg text-mf-milk-500 mt-4">
          <h1>{getTitle()}</h1>
        </div>

        <div className="flex flex-col flex-1">{renderContent()}</div>
      </div>
    </>
  );
};

export default AddWallet;
