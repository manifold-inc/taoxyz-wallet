import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserPlus, FolderInput, SquareArrowLeft } from "lucide-react";

import Disclaimer from "../components/Disclaimer";
import taoxyzLogo from "../../../public/icons/taoxyz.svg";

const Home = () => {
  const navigate = useNavigate();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const address = localStorage.getItem("currentAddress");
  if (address) {
    navigate("/dashboard", { state: { address } });
    return null;
  }

  return (
    <>
      {showDisclaimer ? (
        <Disclaimer onClose={() => setShowDisclaimer(false)} />
      ) : (
        <div className="flex flex-col items-center min-h-screen">
          <div className="h-20" />
          <div className="flex flex-col items-center flex-1">
            <img
              src={taoxyzLogo}
              alt="Taoxyz Logo"
              className="w-16 h-16 mb-8"
            />

            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <h1 className="text-xl font-semibold text-mf-silver-300">
                  Taoxyz Wallet
                </h1>
              </div>

              <div className="space-y-2 flex flex-col items-center">
                <button
                  onClick={() => navigate("/create")}
                  className="w-54 text-sm flex items-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors mb-3 px-4 py-3"
                >
                  <div className="w-1/5 ml-2"></div>
                  <div className="w-4/5 flex items-center gap-2">
                    <UserPlus className="text-mf-safety-300 w-[20px] h-[20px]" />
                    <span className="text-mf-milk-300">Create</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/import")}
                  className="w-54 text-sm flex items-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors mb-3 px-4 py-3"
                >
                  <div className="w-1/5 ml-2"></div>
                  <div className="w-4/5 flex items-center gap-2">
                    <FolderInput className="text-mf-safety-300 w-[20px] h-[20px]" />
                    <span className="text-mf-milk-300">Import</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate("/signin")}
                  className="w-54 text-sm flex items-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors mb-3 px-4 py-3"
                >
                  <div className="w-1/5 ml-2"></div>
                  <div className="w-4/5 flex items-center gap-2">
                    <SquareArrowLeft className="text-mf-safety-300 w-[20px] h-[20px]" />
                    <span className="text-mf-milk-300">Sign In</span>
                  </div>
                </button>

                <div className="flex flex-col items-center mt-2">
                  <button
                    onClick={() => setShowDisclaimer(true)}
                    className="text-xs text-mf-silver-300 hover:text-mf-silver-500 transition-colors underline underline-offset-2 decoration-mf-silver-300 hover:decoration-mf-silver-500"
                  >
                    Disclaimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="h-20" />
        </div>
      )}
    </>
  );
};

export default Home;
