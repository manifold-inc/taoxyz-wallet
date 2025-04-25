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
            {stakes?.map((stake, index) => (
              <StakeOverview
                key={index}
                stake={stake}
                subnet={subnets?.find(subnet => subnet.id === stake.netuid) as Subnet}
                onClick={() => handleStakeSelect(stake)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PortfolioOverview;
