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
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg p-4">
        <div className="text-center mb-6">
          <h1 className="text-[13px] font-semibold text-gray-900">
            Taoxyz Wallet
          </h1>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => navigate("/create")}
            className="w-full text-[10px] text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500 transition-colors"
          >
            Create Wallet
          </button>
          <button
            onClick={() => navigate("/import")}
            className="w-full text-[10px] text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500 transition-colors"
          >
            Import Wallet
          </button>
          <button
            onClick={() => navigate("/signin")}
            className="w-full text-[10px] text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
