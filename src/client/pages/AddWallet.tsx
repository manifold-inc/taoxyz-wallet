import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserPlus, FolderInput } from "lucide-react";
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
    (location.state as AddWalletState)?.mode || "select"
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

  // TODO: Possibly set currentAddress on the mnemonic display page
  const handleContinue = async (wallet: KeyringPair): Promise<void> => {
    console.log("handleContinue", wallet);
    console.log(wallet?.address);
    if (!wallet) {
      showNotification({
        type: NotificationType.Error,
        message: "Could Not Find Wallet",
      });
      return;
    }

    setCurrentAddress(wallet.address);
    setIsLocked(false);
    MessageService.sendClearLockTimer();
    navigate("/dashboard");
  };

  const getTitle = () => {
    switch (mode) {
      case "select":
        return "Add Wallet";
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
      case "select":
        return (
          <div className="flex flex-col items-center space-y-5 mt-8 w-52 [&>*]:w-full text-base">
            <button
              onClick={() => {
                setMode("create-wallet");
              }}
              className="rounded-sm bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors p-3"
            >
              <div className="flex justify-center items-center gap-2 mr-2">
                <UserPlus className="text-mf-safety-500 w-5 h-5" />
                <span className="text-mf-milk-500">Create</span>
              </div>
            </button>
            <button
              onClick={() => {
                setMode("import-mnemonic");
              }}
              className="rounded-sm bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors p-3"
            >
              <div className="flex justify-center items-center gap-2 mr-4">
                <FolderInput className="text-mf-safety-500 w-5 h-5" />
                <span className="text-mf-milk-500">Import</span>
              </div>
            </button>
          </div>
        );

      case "create-wallet":
        return (
          <CreateWallet
            onSuccess={handleCreateWalletSuccess}
            onBack={() => setMode("select")}
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
            onBack={() => setMode("select")}
          />
        );
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
