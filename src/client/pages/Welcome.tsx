import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, FolderInput, ArrowLeft } from "lucide-react";

import { useWallet } from "../contexts/WalletContext";
import Disclaimer from "../components/common/Disclaimer";
import taoxyz from "../../../public/icons/taoxyz.svg";

const Welcome = () => {
  const navigate = useNavigate();
  const { currentAddress } = useWallet();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <>
      {showDisclaimer ? (
        <Disclaimer onClose={() => setShowDisclaimer(false)} />
      ) : (
        <>
          <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16 mt-24" />

          <div>
            <div className="text-center text-lg text-mf-milk-500 mt-4">
              <h1>Taoxyz Wallet</h1>
            </div>

            <div className="space-y-5 flex flex-col items-center w-52 [&>*]:w-full text-base mt-8">
              <button
                onClick={() =>
                  navigate("/add-wallet", { state: { mode: "create-wallet" } })
                }
                className="rounded-sm bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors p-3 cursor-pointer"
              >
                <div className="flex justify-center items-center gap-2 mr-2">
                  <UserPlus className="text-mf-safety-500 w-5 h-5" />
                  <span className="text-mf-milk-500">Sign Up</span>
                </div>
              </button>
              <button
                onClick={() =>
                  navigate("/add-wallet", {
                    state: { mode: "import-mnemonic" },
                  })
                }
                className="rounded-sm bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors p-3 cursor-pointer"
              >
                <div className="flex justify-center items-center gap-2 mr-4">
                  <FolderInput className="text-mf-safety-500 w-5 h-5" />
                  <span className="text-mf-milk-500">Import</span>
                </div>
              </button>
              {currentAddress && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-sm bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors p-3 cursor-pointer"
                >
                  <div className="flex justify-center items-center gap-2 mr-9">
                    <ArrowLeft className="text-mf-safety-500 w-5 h-5" />
                    <span className="text-mf-milk-500">Back</span>
                  </div>
                </button>
              )}

              <div className="flex justify-center mt-2">
                <button onClick={() => setShowDisclaimer(true)}>
                  <span className="text-xs text-mf-safety-500 hover:text-mf-safety-300 transition-colors underline underline-offset-2 decoration-mf-safety-500 hover:decoration-mf-safety-300 cursor-pointer">
                    Disclaimer
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Welcome;
