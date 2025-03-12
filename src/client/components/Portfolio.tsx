import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import { KeyringService } from "../services/KeyringService";
import StakeOverview from "./portfolio/StakeOverview";
import ExpandedStake from "./portfolio/ExpandedStake";
import type { StakeTransaction, Subnet } from "../../types/client";

interface PortfolioProps {
  stakes: StakeTransaction[];
  address: string;
}

const Portfolio = ({ stakes, address }: PortfolioProps) => {
  const { api } = usePolkadotApi();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [selectedStake, setSelectedStake] = useState<StakeTransaction | null>(
    null
  );
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStakeSelect = async (stake: StakeTransaction) => {
    setError(null);
    try {
      setIsLoading(true);
      const subnet = await api?.getSubnet(stake.subnetId);
      if (subnet) {
        setSelectedSubnet(subnet);
        setSelectedStake(stake);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch subnet"
      );
      setSelectedStake(null);
      setSelectedSubnet(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async (stake: StakeTransaction) => {
    setSelectedStake(stake);
    setIsSwapping(true);
  };

  const confirmSwap = async () => {
    if (!api || !selectedStake) {
      setError("No API or stake selected");
      return;
    }
    setError(null);

    try {
      const account = await KeyringService.getAccount(address);
      const username = account.meta.username as string;
      await KeyringService.unlockAccount(username, password);

      const convertedStake = selectedStake.tokens / 1e9;
      await api.removeStake({
        address,
        validatorHotkey: selectedStake.validatorHotkey,
        subnetId: selectedStake.subnetId,
        amount: convertedStake,
      });

      setPassword("");
      setSelectedStake(null);
      setSelectedSubnet(null);
      setIsSwapping(false);
      navigate("/dashboard", { state: { address } });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to swap");
    }
  };

  if (!api) {
    return (
      <div className="flex justify-center items-center h-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-milk-300" />
      </div>
    );
  }

  return (
    <div>
      {selectedStake ? (
        <ExpandedStake
          stake={selectedStake}
          subnet={selectedSubnet}
          onClose={() => {
            setSelectedStake(null);
            setSelectedSubnet(null);
            setError(null);
          }}
          onSwap={handleSwap}
        />
      ) : (
        <>
          {stakes.length > 0 ? (
            <div className="space-y-1.5">
              {stakes.map((stake, index) => (
                <StakeOverview
                  key={index}
                  stake={stake}
                  onClick={() => handleStakeSelect(stake)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-mf-ash-500 rounded-lg p-2.5">
              <p className="text-xs text-mf-silver-300">No stakes found</p>
            </div>
          )}
        </>
      )}

      {error && !isSwapping && (
        <div className="mt-2 p-3 bg-mf-ash-500 rounded-lg">
          <p className="text-xs text-mf-safety-300 text-center">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-2 flex justify-center items-center h-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-milk-300" />
        </div>
      )}

      {isSwapping && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-mf-ash-500 rounded-lg p-4 max-w-sm w-full mx-4">
            <h3 className="text-xs font-medium text-mf-milk-300 mb-4">
              Enter Password to Swap
            </h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 text-[10px] rounded-lg bg-mf-ash-300 border border-mf-ash-400 text-mf-milk-300 placeholder:text-mf-silver-300 focus:outline-none focus:border-mf-safety-300 mb-4"
            />
            {error && (
              <div className="p-3 bg-mf-ash-300 text-mf-sybil-300 text-[10px] rounded-lg mb-4">
                {error}
              </div>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setIsSwapping(false);
                  setPassword("");
                  setError(null);
                }}
                className="flex-1 py-2 px-3 text-[10px] rounded-lg bg-mf-ash-300 text-mf-milk-300 hover:bg-mf-ash-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSwap}
                className="flex-1 py-2 px-3 text-[10px] text-mf-sybil-300 rounded-lg bg-mf-ash-300 hover:bg-mf-ash-400 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
