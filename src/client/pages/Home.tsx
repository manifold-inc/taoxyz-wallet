import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const savedAddress = localStorage.getItem("currentAddress");
    if (savedAddress) {
      navigate("/dashboard", { state: { address: savedAddress } });
    }
  }, [navigate]);

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-mf-night-300 to-mf-night-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-mf-ash-500 rounded-lg p-4">
        <div className="text-center mb-6">
          <h1 className="text-[13px] font-semibold text-mf-silver-300">
            Taoxyz Wallet
          </h1>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => navigate("/create")}
            className="w-full text-[10px] text-left px-4 py-3 rounded-lg border border-mf-ash-300 text-mf-milk-300 hover:bg-mf-ash-300 hover:text-mf-safety-300 hover:border-mf-safety-500 transition-colors"
          >
            Create Wallet
          </button>
          <button
            onClick={() => navigate("/import")}
            className="w-full text-[10px] text-left px-4 py-3 rounded-lg border border-mf-ash-300 text-mf-milk-300 hover:bg-mf-ash-300 hover:text-mf-safety-300 hover:border-mf-safety-500 transition-colors"
          >
            Import Wallet
          </button>
          <button
            onClick={() => navigate("/signin")}
            className="w-full text-[10px] text-left px-4 py-3 rounded-lg border border-mf-ash-300 text-mf-milk-300 hover:bg-mf-ash-300 hover:text-mf-safety-300 hover:border-mf-safety-500 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
