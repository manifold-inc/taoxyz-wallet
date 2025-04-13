import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ConfirmAction from '@/client/components/common/ConfirmAction';
import Skeleton from '@/client/components/common/Skeleton';
import ExpandedStake from '@/client/components/portfolio/ExpandedStake';
import StakeOverview from '@/client/components/portfolio/StakeOverview';
import { useLock } from '@/client/contexts/LockContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import KeyringService from '@/client/services/KeyringService';
import MessageService from '@/client/services/MessageService';
import { NotificationType } from '@/types/client';
import type { Stake, Subnet } from '@/types/client';
import { formatNumber } from '@/utils/utils';

interface PortfolioProps {
  stakes: Stake[];
  subnets: Subnet[];
  address: string;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

const StakeOverviewSkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map(index => (
        <div key={index} className="w-full rounded-md p-3 bg-mf-ash-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

const PortfolioOverview = ({ stakes, subnets, address, isLoading, onRefresh }: PortfolioProps) => {
  const navigate = useNavigate();
  const { setIsLocked } = useLock();
  const { showNotification } = useNotification();
  const { api } = usePolkadotApi();
  const [selectedStake, setSelectedStake] = useState<Stake | null>(null);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
  const [showRemoveStakeConfirm, setShowRemoveStakeConfirm] = useState(false);

  const handleStakeSelect = (stake: Stake): void => {
    const subnet = subnets.find(subnet => subnet.id === stake.netuid);
    if (subnet) {
      setSelectedSubnet(subnet);
      setSelectedStake(stake);
    } else {
      showNotification({
        message: 'Failed to Fetch Subnet',
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
    navigate('/move-stake', {
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
      if (!selectedStake.stake || isNaN(selectedStake.stake)) {
        showNotification({
          type: NotificationType.Error,
          message: 'Invalid Stake Amount',
        });
        return;
      }

      showNotification({
        type: NotificationType.Pending,
        message: 'Submitting Transaction...',
      });

      const result = await api.removeStake({
        address,
        validatorHotkey: selectedStake.hotkey,
        subnetId: selectedStake.netuid,
        amountInRao: BigInt(selectedStake.stake),
      });

      showNotification({
        message: 'Transaction Successful!',
        type: NotificationType.Success,
        hash: result,
      });

      setSelectedStake(null);
      setSelectedSubnet(null);

      onRefresh();
    } catch {
      showNotification({
        message: 'Failed to Remove Stake',
        type: NotificationType.Error,
      });
    }
  };

  return (
    <>
      <ConfirmAction
        isOpen={showRemoveStakeConfirm}
        title="Confirm Remove Stake"
        message={
          selectedStake
            ? `Are you sure you want to remove your stake of ${formatNumber(
                selectedStake.stake / 1e9
              )} ${selectedStake.netuid === 0 ? 'τ' : 'α'} from Subnet ${selectedStake.netuid}?`
            : ''
        }
        onConfirm={handleConfirmRemoveStake}
        onCancel={() => setShowRemoveStakeConfirm(false)}
      />
      {selectedStake ? (
        <ExpandedStake
          stake={selectedStake}
          subnet={selectedSubnet as Subnet}
          onClose={() => {
            setSelectedStake(null);
            setSelectedSubnet(null);
          }}
          onRemoveStake={handleRemoveStake}
          onMoveStake={handleMoveStake}
        />
      ) : (
        <div className="w-full">
          {isLoading ? (
            <StakeOverviewSkeleton />
          ) : (
            <div className="flex flex-col gap-3">
              {stakes.map((stake, index) => (
                <StakeOverview
                  key={index}
                  stake={stake}
                  subnet={subnets.find(subnet => subnet.id === stake.netuid) as Subnet}
                  onClick={() => handleStakeSelect(stake)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PortfolioOverview;
