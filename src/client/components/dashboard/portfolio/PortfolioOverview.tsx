import { Download, Plus } from 'lucide-react';

import ExpandedStake from '@/client/components/dashboard/portfolio/ExpandedStake';
import StakeOverview from '@/client/components/dashboard/portfolio/StakeOverview';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import { NotificationType } from '@/types/client';
import type { Stake, Subnet, Validator } from '@/types/client';

const PortfolioOverview = () => {
  const { showNotification } = useNotification();
  const { api } = usePolkadotApi();
  const {
    setDashboardState,
    setDashboardSubnet,
    setDashboardValidator,
    setDashboardValidators,
    setDashboardStake,
    resetDashboardState,
    dashboardStake,
    dashboardSubnet,
    dashboardSubnets: subnets,
    dashboardStakes: stakes,
  } = useDashboard();

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
      setDashboardSubnet(subnet);
      setDashboardStake(stake);
    } else {
      showNotification({
        message: 'Failed to Fetch Subnet',
        type: NotificationType.Error,
      });
      setDashboardSubnet(null);
      setDashboardStake(null);
    }
  };

  const handleAddStake = async (): Promise<void> => {
    setDashboardState(DashboardState.ADD_STAKE);
    const [validator, validators] = await Promise.all([
      getValidator(dashboardSubnet as Subnet, dashboardStake?.hotkey as string),
      getValidators(dashboardSubnet as Subnet),
    ]);
    if (validator === null) return;
    if (validators === null) return;
    setDashboardValidator(validator);
    setDashboardValidators(validators);
  };

  const handleMoveStake = async (): Promise<void> => {
    setDashboardState(DashboardState.MOVE_STAKE);
    const [validator, validators] = await Promise.all([
      getValidator(dashboardSubnet as Subnet, dashboardStake?.hotkey as string),
      getValidators(dashboardSubnet as Subnet),
    ]);
    if (validator === null) return;
    if (validators === null) return;
    setDashboardValidator(validator);
    setDashboardValidators(validators);
  };

  const handleRemoveStake = async (): Promise<void> => {
    setDashboardState(DashboardState.REMOVE_STAKE);
    const [validator, validators] = await Promise.all([
      getValidator(dashboardSubnet as Subnet, dashboardStake?.hotkey as string),
      getValidators(dashboardSubnet as Subnet),
    ]);
    if (validator === null) return;
    if (validators === null) return;
    setDashboardValidator(validator);
    setDashboardValidators(validators);
  };

  return (
    <>
      {dashboardStake ? (
        <ExpandedStake
          stake={dashboardStake}
          subnet={dashboardSubnet as Subnet}
          onClose={() => {
            setDashboardStake(null);
            setDashboardSubnet(null);
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
            {stakes && stakes.length > 0 ? (
              stakes.map((stake, index) => (
                <StakeOverview
                  key={index}
                  stake={stake}
                  subnet={subnets?.find(subnet => subnet.id === stake.netuid) as Subnet}
                  onClick={() => handleStakeSelect(stake)}
                />
              ))
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
