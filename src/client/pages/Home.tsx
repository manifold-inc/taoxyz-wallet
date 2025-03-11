import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import taoxyzLogo from "../../../public/icons/taoxyz.svg";
import { UserPlus, FolderInput, SquareArrowLeft } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const savedAddress = localStorage.getItem("currentAddress");
    if (savedAddress) {
      navigate("/dashboard", { state: { address: savedAddress } });
    }
  }, [navigate]);

  return (
    <div className="bg-mf-night-700 flex flex-col items-center justify-between min-h-screen p-4">
      <div className="flex-1" />
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <img src={taoxyzLogo} alt="Taoxyz Logo" className="w-16 h-16" />
        </div>

        <div className="w-full max-w-md bg-mf-night-700">
          <div className="text-center mb-6">
            <h1 className="text-[20px] font-semibold text-mf-silver-300">
              Taoxyz Wallet
            </h1>
          </div>

          <div className="space-y-2 flex flex-col items-center">
            <button
              onClick={() => navigate("/create")}
              className="w-54 text-[14px] flex items-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors mb-3 px-4 py-3"
            >
              <div className="w-1/5 ml-2"></div>
              <div className="w-4/5 flex items-center gap-2">
                <UserPlus className="text-mf-safety-300 w-[20px] h-[20px]" />
                <span className="text-mf-milk-300">Create</span>
              </div>
            </button>
            <button
              onClick={() => navigate("/import")}
              className="w-54 text-[14px] flex items-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors mb-3 px-4 py-3"
            >
              <div className="w-1/5 ml-2"></div>
              <div className="w-4/5 flex items-center gap-2">
                <FolderInput className="text-mf-safety-300 w-[20px] h-[20px]" />
                <span className="text-mf-milk-300">Import</span>
              </div>
            </button>
            <button
              onClick={() => navigate("/signin")}
              className="w-54 text-[14px] flex items-center rounded-lg bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors mb-3 px-4 py-3"
            >
              <div className="w-1/5 ml-2"></div>
              <div className="w-4/5 flex items-center gap-2">
                <SquareArrowLeft className="text-mf-safety-300 w-[20px] h-[20px]" />
                <span className="text-mf-milk-300">Sign In</span>
              </div>
            </button>

            <div className="flex flex-col items-center mt-2">
              <p className="text-[10px] text-mf-silver-300 text-center">
                Disclaimer
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1" />
    </div>
  );
};

export default Home;
