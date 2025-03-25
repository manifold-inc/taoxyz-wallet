import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../../contexts/PolkadotApiContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useLock } from "../../contexts/LockContext";
import KeyringService from "../../services/KeyringService";
import MessageService from "../../services/MessageService";
import StakeOverview from "../portfolio/StakeOverview";
import ExpandedStake from "../portfolio/ExpandedStake";
import type { StakeTransaction, Subnet } from "../../../types/client";
import { NotificationType } from "../../../types/client";

interface PortfolioProps {
  stakes: StakeTransaction[];
  address: string;
  onRefresh: () => Promise<void>;
}

const Portfolio = ({ stakes, address, onRefresh }: PortfolioProps) => {
  const navigate = useNavigate();
  const { setIsLocked } = useLock();
  const { showNotification } = useNotification();
  const { api } = usePolkadotApi();
  const [selectedStake, setSelectedStake] = useState<StakeTransaction | null>(
    null
  );
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);

  const handleStakeSelect = async (stake: StakeTransaction): Promise<void> => {
    const subnet = await api?.getSubnet(stake.subnetId);
    if (subnet) {
      setSelectedSubnet(subnet);
      setSelectedStake(stake);
    } else {
      showNotification({
        message: "Failed to Fetch Subnet",
        type: NotificationType.Error,
      });
      setSelectedStake(null);
      setSelectedSubnet(null);
    }
  };

  const handleAuth = async (): Promise<boolean> => {
    if (await KeyringService.isLocked(address)) {
      await setIsLocked(true);
      await MessageService.sendWalletsLocked();
      return false;
    }
    return true;
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
    const isAuthorized = await handleAuth();
    if (!isAuthorized) return;

    try {
      showNotification({
        type: NotificationType.Pending,
        message: "Submitting Transaction...",
      });

      const convertedStake = selectedStake.tokens / 1e9;
      const result = await api.removeStake({
        address,
        validatorHotkey: selectedStake.validatorHotkey,
        subnetId: selectedStake.subnetId,
        amount: convertedStake,
      });

      showNotification({
        message: "Transaction Successful!",
        type: NotificationType.Success,
        hash: result,
      });

      setSelectedStake(null);
      setSelectedSubnet(null);

      onRefresh();
    } catch {
      showNotification({
        message: "Failed to Swap Stake",
        type: NotificationType.Error,
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
    </div>
  );
};

export default Portfolio;
