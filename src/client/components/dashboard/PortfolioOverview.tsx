import { useState } from 'react';

import Skeleton from '@/client/components/common/Skeleton';
import ExpandedStake from '@/client/components/portfolio/ExpandedStake';
import StakeOverview from '@/client/components/portfolio/StakeOverview';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import { NotificationType } from '@/types/client';
import type { Stake, Subnet } from '@/types/client';

interface PortfolioProps {
  stakes: Stake[];
  subnets: Subnet[];
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

const PortfolioOverview = ({ stakes, subnets, isLoading }: PortfolioProps) => {
  const { showNotification } = useNotification();
  const { api } = usePolkadotApi();
  const { setDashboardState, setDashboardSubnet, setDashboardValidator } = useDashboard();
  const [selectedStake, setSelectedStake] = useState<Stake | null>(null);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);

  const getValidator = async (subnet: Subnet, hotkey: string) => {
    const result = await api?.getValidators(subnet.id);
    if (!result) {
      showNotification({
        message: 'Failed to Fetch Validators',
        type: NotificationType.Error,
      });
      return null;
    }
    return result.find(validator => validator.hotkey === hotkey) || null;
  };

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

  const handleAddStake = async (): Promise<void> => {
    setDashboardState(DashboardState.ADD_STAKE);
    setDashboardSubnet(selectedSubnet);
    const validator = await getValidator(selectedSubnet as Subnet, selectedStake?.hotkey as string);
    if (validator === null) return;
    setDashboardValidator(validator);
  };

  const handleMoveStake = async (): Promise<void> => {
    setDashboardState(DashboardState.MOVE_STAKE);
    setDashboardSubnet(selectedSubnet);
    const validator = await getValidator(selectedSubnet as Subnet, selectedStake?.hotkey as string);
    if (validator === null) return;
    setDashboardValidator(validator);
  };

  const handleRemoveStake = async (): Promise<void> => {
    setDashboardState(DashboardState.REMOVE_STAKE);
    setDashboardSubnet(selectedSubnet);
    const validator = await getValidator(selectedSubnet as Subnet, selectedStake?.hotkey as string);
    if (validator === null) return;
    setDashboardValidator(validator);
  };

  return (
    <>
      {selectedStake ? (
        <ExpandedStake
          stake={selectedStake}
          subnet={selectedSubnet as Subnet}
          onClose={() => {
            setSelectedStake(null);
            setSelectedSubnet(null);
          }}
          onAddStake={handleAddStake}
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
