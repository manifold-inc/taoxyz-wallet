import { Download, Plus } from 'lucide-react';

import { useMemo } from 'react';

import { newApi } from '@/api/api';
import ExpandedStake from '@/client/components/dashboard/portfolio/ExpandedStake';
import StakeOverview from '@/client/components/dashboard/portfolio/StakeOverview';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { useWallet } from '@/client/contexts/WalletContext';
import { NotificationType } from '@/types/client';
import type { Stake } from '@/types/client';
import type { Validator } from '@/types/client';

interface PortfolioOverviewProps {
  selectedStakeKey: string | null;
  onStakeSelect: (stakeKey: string | null) => void;
}

const PortfolioOverview = ({ selectedStakeKey, onStakeSelect }: PortfolioOverviewProps) => {
  const { showNotification } = useNotification();
  const { currentAddress } = useWallet();
  const { setDashboardState, resetDashboardState } = useDashboard();

  const { data: subnets, isLoading: isLoadingSubnets } = newApi.subnets.getAll();
  const { data: stakes } = newApi.stakes.getAllStakes(currentAddress || '');

  // Derive the selected stake from stakes data and selectedStakeKey
  const dashboardStake = useMemo(() => {
    if (!stakes || !selectedStakeKey) return null;
    return stakes.find(stake => `${stake.hotkey}-${stake.netuid}` === selectedStakeKey) || null;
  }, [stakes, selectedStakeKey]);

  // Derive the selected subnet from the selected stake and subnets data
  const selectedSubnet =
    dashboardStake && subnets ? subnets.find(subnet => subnet.id === dashboardStake.netuid) : null;

  const handleStakeSelect = (stake: Stake): void => {
    const subnet = subnets?.find(subnet => subnet.id === stake.netuid);
    if (subnet) {
      // setDashboardStake(stake);
      onStakeSelect(`${stake.hotkey}-${stake.netuid}`);
    } else {
      showNotification({
        message: 'Failed to Fetch Subnet',
        type: NotificationType.Error,
      });
      // setDashboardStake(null);
      onStakeSelect(null);
    }
  };

  const handleAddStake = async (): Promise<void> => {
    if (!selectedSubnet || !dashboardStake) return;

    const validator: Validator = {
      hotkey: dashboardStake.hotkey,
      coldkey: dashboardStake.coldkey,
      name: dashboardStake.hotkey.slice(0, 6) + '...' + dashboardStake.hotkey.slice(-6),
      index: 0,
    };

    setDashboardState(DashboardState.ADD_STAKE, {
      subnet: selectedSubnet,
      validator: validator,
    });
  };

  const handleMoveStake = async (): Promise<void> => {
    if (!selectedSubnet || !dashboardStake) return;

    const validator: Validator = {
      hotkey: dashboardStake.hotkey,
      coldkey: dashboardStake.coldkey,
      name: dashboardStake.hotkey.slice(0, 6) + '...' + dashboardStake.hotkey.slice(-6),
      index: 0,
    };

    setDashboardState(DashboardState.MOVE_STAKE, {
      subnet: selectedSubnet,
      validator: validator,
    });
  };

  const handleRemoveStake = async (): Promise<void> => {
    if (!selectedSubnet || !dashboardStake) return;

    const validator: Validator = {
      hotkey: dashboardStake.hotkey,
      coldkey: dashboardStake.coldkey,
      name: dashboardStake.hotkey.slice(0, 6) + '...' + dashboardStake.hotkey.slice(-6),
      index: 0,
    };

    setDashboardState(DashboardState.REMOVE_STAKE, {
      subnet: selectedSubnet,
      validator: validator,
    });
  };

  return (
    <>
      {dashboardStake && selectedSubnet ? (
        <ExpandedStake
          stake={dashboardStake}
          subnet={selectedSubnet}
          onClose={() => {
            onStakeSelect(null);
          }}
          onAddStake={handleAddStake}
          onRemoveStake={handleRemoveStake}
          onMoveStake={handleMoveStake}
        />
      ) : (
        <div className="w-full">
          <div className="flex flex-col gap-3">
            {stakes && stakes.length > 0 && subnets && !isLoadingSubnets ? (
              stakes.map((stake, index) => {
                const subnet = subnets.find(subnet => subnet.id === stake.netuid);
                if (!subnet) return null; // Skip rendering if subnet not found
                return (
                  <StakeOverview
                    key={index}
                    stake={stake}
                    subnet={subnet}
                    onClick={() => handleStakeSelect(stake)}
                  />
                );
              })
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    resetDashboardState();
                    setDashboardState(DashboardState.TRANSFER);
                  }}
                  className="w-full p-4 bg-mf-ash-500 rounded-md hover:bg-mf-ash-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-mf-edge-500 font-semibold text-xs-sm pb-1">
                        Transfer Tao
                      </h3>
                      <p className="text-mf-sybil-500 font-light text-xs">
                        Add Tao to Tao.xyz Wallet
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-mf-ash-300 rounded-full">
                      <Download className="w-5 h-5 text-mf-safety-500" />
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    resetDashboardState();
                    setDashboardState(DashboardState.CREATE_STAKE);
                  }}
                  className="w-full p-4 bg-mf-ash-500 rounded-md hover:bg-mf-ash-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-mf-edge-500 font-semibold text-xs-sm pb-1">New Stake</h3>
                      <p className="text-mf-sybil-500 font-light text-xs">Stake Tao on a Subnet</p>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 bg-mf-ash-300 rounded-full">
                      <Plus className="w-5 h-5 text-mf-safety-500" />
                    </div>
                  </div>
                </button>
                <div className="text-center pt-8">
                  <p className="text-mf-safety-500 font-thin text-xs">Add TAO to get Started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PortfolioOverview;
