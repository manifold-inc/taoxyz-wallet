import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePolkadotApi } from "../../contexts/PolkadotApiContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useLock } from "../../contexts/LockContext";
import KeyringService from "../../services/KeyringService";
import MessageService from "../../services/MessageService";
import StakeOverview from "../portfolio/StakeOverview";
import ExpandedStake from "../portfolio/ExpandedStake";
import ConfirmAction from "../ConfirmAction";
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
  const [showRemoveStakeConfirm, setShowRemoveStakeConfirm] = useState(false);

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
    navigate("/move-stake", {
      state: {
        selectedStake,
        selectedSubnet,
      },
    });
  };

  const handleRemoveStake = async (): Promise<void> => {
    if (!api || !selectedStake) return;
    const isAuthorized = await handleAuth();
    if (!isAuthorized) return;

    setShowRemoveStakeConfirm(true);
  };

  const handleConfirmRemoveStake = async (): Promise<void> => {
    if (!api || !selectedStake) return;
    setShowRemoveStakeConfirm(false);

    try {
      if (!selectedStake.tokens || isNaN(selectedStake.tokens)) {
        showNotification({
          type: NotificationType.Error,
          message: "Invalid Stake Amount",
        });
        return;
      }

      showNotification({
        type: NotificationType.Pending,
        message: "Submitting Transaction...",
      });

      const result = await api.removeStake({
        address,
        validatorHotkey: selectedStake.validatorHotkey,
        subnetId: selectedStake.subnetId,
        amountInRao: BigInt(selectedStake.tokens),
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
        message: "Failed to Remove Stake",
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
    <>
      <ConfirmAction
        isOpen={showRemoveStakeConfirm}
        title="Confirm Remove Stake"
        message={
          selectedStake
            ? `Are you sure you want to remove your stake of ${(
                selectedStake.tokens / 1e9
              ).toFixed(4)} α from Subnet ${selectedStake.subnetId}?`
            : ""
        }
        onConfirm={handleConfirmRemoveStake}
        onCancel={() => setShowRemoveStakeConfirm(false)}
      />
      {selectedStake ? (
        <ExpandedStake
          stake={selectedStake}
          subnet={selectedSubnet}
          onClose={() => {
            setSelectedStake(null);
            setSelectedSubnet(null);
          }}
          onRemoveStake={handleRemoveStake}
          onMoveStake={handleMoveStake}
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
            <div className="border-sm border-2 border-mf-ash-500 p-2 bg-mf-ash-500 text-sm text-mf-milk-300">
              <p>No Stakes</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Portfolio;
