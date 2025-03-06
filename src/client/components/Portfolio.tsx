import { useNavigate } from "react-router-dom";
import { useRpcApi } from "../contexts/RpcApiContext";
import type { StakeTransaction } from "../../types/stakeTransaction";

interface PortfolioProps {
  stakes: StakeTransaction[];
  address: string;
}

export const Portfolio = ({ stakes, address }: PortfolioProps) => {
  const { api } = useRpcApi();
  const navigate = useNavigate();

  const handleUnstake = async (stake: StakeTransaction) => {
    if (!api) return;
    try {
      const convertedStake = stake.tokens / 1e9;
      await api.removeStake({
        address,
        validatorHotkey: stake.validatorHotkey,
        subnetId: stake.subnetId,
        amount: convertedStake,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("[Client] Failed to unstake:", error);
    }
  };

  return (
    <div className={`bg-white rounded-lg p-4 shadow`}>
      <h2 className="text-lg font-semibold mb-4">Stakes</h2>
      {stakes.length > 0 ? (
        <div className="space-y-4">
          {stakes.map((stake, index) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <p>
                <span className="font-medium">Subnet:</span> {stake.subnetId}
              </p>
              <p className="break-all">
                <span className="font-medium">Validator:</span>{" "}
                {stake.validatorHotkey}
              </p>
              <p>
                <span className="font-medium">Tokens:</span>{" "}
                {(stake.tokens / 1e9).toFixed(4)}
              </p>
              <button
                onClick={() => handleUnstake(stake)}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Unstake
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No stakes found</p>
      )}
    </div>
  );
};
