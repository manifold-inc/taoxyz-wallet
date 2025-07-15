import { Download, Plus } from 'lucide-react';

import { useMemo } from 'react';

import { newApi } from '@/api/api';
import ExpandedStake from '@/client/components/dashboard/portfolio/ExpandedStake';
import StakeOverview from '@/client/components/dashboard/portfolio/StakeOverview';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import { useWallet } from '@/client/contexts/WalletContext';
import { NotificationType } from '@/types/client';
import type { Stake, Subnet, Validator } from '@/types/client';

interface PortfolioOverviewProps {
  selectedStakeKey: string | null;
  onStakeSelect: (stakeKey: string | null) => void;
}

const PortfolioOverview = ({ selectedStakeKey, onStakeSelect }: PortfolioOverviewProps) => {
  const { showNotification } = useNotification();
  const { api } = usePolkadotApi();
  const { currentAddress } = useWallet();
  const { setDashboardState, setDashboardValidator, setDashboardValidators, resetDashboardState } =
    useDashboard();

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

  const getValidator = async (subnet: Subnet, hotkey: string): Promise<Validator | null> => {
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

  const getValidators = async (subnet: Subnet): Promise<Validator[] | null> => {
    const result = await api?.getValidators(subnet.id);
    if (!result) {
      showNotification({
        message: 'Failed to Fetch Validators',
        type: NotificationType.Error,
      });
      return null;
    }
    return result;
  };

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
    if (!selectedSubnet) return;
    setDashboardState(DashboardState.ADD_STAKE);
    const [validator, validators] = await Promise.all([
      getValidator(selectedSubnet, dashboardStake?.hotkey as string),
      getValidators(selectedSubnet),
    ]);
    if (validator === null) return;
    if (validators === null) return;
    setDashboardValidator(validator);
    setDashboardValidators(validators);
  };

  const handleMoveStake = async (): Promise<void> => {
    if (!selectedSubnet) return;
    setDashboardState(DashboardState.MOVE_STAKE);
    const [validator, validators] = await Promise.all([
      getValidator(selectedSubnet, dashboardStake?.hotkey as string),
      getValidators(selectedSubnet),
    ]);
    if (validator === null) return;
    if (validators === null) return;
    setDashboardValidator(validator);
    setDashboardValidators(validators);
  };

  const handleRemoveStake = async (): Promise<void> => {
    if (!selectedSubnet) return;
    setDashboardState(DashboardState.REMOVE_STAKE);
    const [validator, validators] = await Promise.all([
      getValidator(selectedSubnet, dashboardStake?.hotkey as string),
      getValidators(selectedSubnet),
    ]);
    if (validator === null) return;
    if (validators === null) return;
    setDashboardValidator(validator);
    setDashboardValidators(validators);
  };

  return (
    <>
      {dashboardStake && selectedSubnet ? (
        <ExpandedStake
          stake={dashboardStake}
          subnet={selectedSubnet}
          onClose={() => {
            onStakeSelect(null);
            setDashboardValidator(null);
            setDashboardValidators(null);
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
