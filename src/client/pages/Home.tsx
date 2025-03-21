import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserPlus, FolderInput, CircleArrowRight } from "lucide-react";

import Disclaimer from "../components/Disclaimer";
import taoxyz from "../../../public/icons/taoxyz.svg";

const Home = () => {
  const navigate = useNavigate();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async (): Promise<void> => {
    const resultAddress = await chrome.storage.local.get("currentAddress");
    const resultLocked = await chrome.storage.local.get("walletLocked");
    if (resultAddress.currentAddress && !resultLocked.walletLocked) {
      navigate("/dashboard");
    }
  };

  return (
    <>
      {showDisclaimer ? (
        <Disclaimer onClose={() => setShowDisclaimer(false)} />
      ) : (
        <div className="flex flex-col items-center min-h-screen">
          <img src={taoxyz} alt="Taoxyz Logo" className="w-16 h-16 mt-24" />

          <div>
            <div className="text-center text-lg text-mf-milk-500 mt-4">
              <h1>Taoxyz Wallet</h1>
            </div>

            <div className="space-y-5 flex flex-col items-center w-52 [&>*]:w-full text-base mt-8">
              <button
                onClick={() => navigate("/create")}
                className="rounded-sm bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors p-3"
              >
                <div className="flex justify-center items-center gap-2 mr-2">
                  <UserPlus className="text-mf-safety-500 w-5 h-5" />
                  <span className="text-mf-milk-500">Sign Up</span>
                </div>
              </button>
              <button
                onClick={() => navigate("/import")}
                className="rounded-sm bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors p-3"
              >
                <div className="flex justify-center items-center gap-2 mr-4">
                  <FolderInput className="text-mf-safety-500 w-5 h-5" />
                  <span className="text-mf-milk-500">Import</span>
                </div>
              </button>
              <button
                onClick={() => navigate("/login")}
                className="rounded-sm bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors p-3"
              >
                <div className="flex justify-center items-center gap-2 mr-4">
                  <CircleArrowRight className="text-mf-safety-500 w-5 h-5" />
                  <span className="text-mf-milk-500">Log In</span>
                </div>
              </button>

              <div className="flex justify-center mt-2">
                <button onClick={() => setShowDisclaimer(true)}>
                  <span className="text-xs text-mf-safety-500 hover:text-mf-safety-300 transition-colors underline underline-offset-2 decoration-mf-safety-500 hover:decoration-mf-safety-300">
                    Disclaimer
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
