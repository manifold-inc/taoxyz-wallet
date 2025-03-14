import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../contexts/PolkadotApiContext";
import KeyringService from "../services/KeyringService";
import MessageService from "../services/MessageService";
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
  const [selectedStake, setSelectedStake] = useState<StakeTransaction | null>(
    () => {
      const storedStake = localStorage.getItem("storeStakeSelection");
      if (storedStake) {
        localStorage.removeItem("storeStakeSelection");
        return JSON.parse(storedStake);
      }
      return null;
    }
  );
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
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

  const handleMoveStake = () => {
    navigate("/stake", {
      state: {
        selectedStake,
        selectedSubnet,
      },
    });
  };

  const handleAuth = async () => {
    if (KeyringService.isLocked(address)) {
      localStorage.setItem("accountLocked", "true");
      localStorage.setItem(
        "storeStakeSelection",
        JSON.stringify(selectedStake)
      );
      MessageService.sendAccountsLockedMessage();
      return;
    }
  };

  const handleSwap = async () => {
    if (!api || !selectedStake) return;
    setError(null);

    try {
      await handleAuth();
      const convertedStake = selectedStake.tokens / 1e9;
      await api.removeStake({
        address,
        validatorHotkey: selectedStake.validatorHotkey,
        subnetId: selectedStake.subnetId,
        amount: convertedStake,
      });

      setSelectedStake(null);
      setSelectedSubnet(null);
      navigate("/dashboard");
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
          onMoveStake={handleMoveStake}
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

      {error && (
        <div className="mt-2 p-3 bg-mf-ash-500 rounded-lg">
          <p className="text-xs text-mf-safety-300 text-center">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-2 flex justify-center items-center h-16">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-milk-300" />
        </div>
      )}
    </div>
  );
};

export default Portfolio;
