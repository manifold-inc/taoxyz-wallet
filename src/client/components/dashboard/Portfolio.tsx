import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../../contexts/PolkadotApiContext";
import KeyringService from "../../services/KeyringService";
import MessageService from "../../services/MessageService";
import TransactionNotification from "../TransactionNotification";
import StakeOverview from "../portfolio/StakeOverview";
import ExpandedStake from "../portfolio/ExpandedStake";
import type { StakeTransaction, Subnet } from "../../../types/client";

interface PortfolioProps {
  stakes: StakeTransaction[];
  address: string;
  onRefresh: () => Promise<void>;
}

// TODO: Replace error handling with notification and refine spinner
const Portfolio = ({ stakes, address, onRefresh }: PortfolioProps) => {
  const navigate = useNavigate();
  const { api } = usePolkadotApi();
  const [selectedStake, setSelectedStake] = useState<StakeTransaction | null>(
    null
  );
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<{
    type: "pending" | "success" | "error";
    message: string;
    hash?: string;
  } | null>(null);

  useEffect(() => {
    init();
  }, [address]);

  const init = async (): Promise<void> => {
    setSelectedStake(null);
    setSelectedSubnet(null);
    const result = await chrome.storage.local.get("storeStakeSelection");
    if (result.storeStakeSelection) {
      setSelectedStake(result.storeStakeSelection);
      await chrome.storage.local.remove("storeStakeSelection");
    }
  };

  const handleStakeSelect = async (stake: StakeTransaction): Promise<void> => {
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

  const handleAuth = async (): Promise<void> => {
    if (await KeyringService.isLocked(address)) {
      await chrome.storage.local.set({ walletLocked: true });
      await chrome.storage.local.set({
        storeStakeSelection: selectedStake,
      });
      MessageService.sendWalletsLockedMessage();
      return;
    }
  };

  const handleMoveStake = (): void => {
    navigate("/stake", {
      state: {
        selectedStake,
        selectedSubnet,
      },
    });
  };

  const handleSwap = async (): Promise<void> => {
    if (!api || !selectedStake) return;
    setError(null);
    setTxStatus({
      type: "pending",
      message: "Submitting transaction...",
    });

    try {
      await handleAuth();
      const convertedStake = selectedStake.tokens / 1e9;
      const result = await api.removeStake({
        address,
        validatorHotkey: selectedStake.validatorHotkey,
        subnetId: selectedStake.subnetId,
        amount: convertedStake,
      });

      setTxStatus({
        type: "success",
        message: "Transaction finalized!",
        hash: result,
      });

      setSelectedStake(null);
      setSelectedSubnet(null);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to swap";
      setError(errorMessage);
      setTxStatus({
        type: "error",
        message: errorMessage,
      });
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
          onRefresh={onRefresh}
        />
      ) : (
        <div className="w-full max-h-76 overflow-y-auto portfolio-container mt-2">
          {stakes.length > 0 ? (
            <div className="space-y-3">
              {stakes.map((stake, index) => (
                <StakeOverview
                  key={index}
                  stake={stake}
                  onClick={() => handleStakeSelect(stake)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-sm p-2 bg-mf-ash-500 text-sm text-mf-milk-300">
              <p>No stakes</p>
            </div>
          )}
        </div>
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

      {txStatus && (
        <TransactionNotification
          type={txStatus.type}
          message={txStatus.message}
          hash={txStatus.hash}
        />
      )}
    </div>
  );
};

export default Portfolio;
