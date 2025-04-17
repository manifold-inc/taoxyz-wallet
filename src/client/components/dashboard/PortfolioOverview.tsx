import Skeleton from '@/client/components/common/Skeleton';
import ExpandedStake from '@/client/components/portfolio/ExpandedStake';
import StakeOverview from '@/client/components/portfolio/StakeOverview';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import { NotificationType } from '@/types/client';
import type { Stake, Subnet, Validator } from '@/types/client';

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
  const {
    setDashboardState,
    setDashboardSubnet,
    setDashboardValidator,
    setDashboardValidators,
    setDashboardStake,
    dashboardStake,
    dashboardSubnet,
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
    const subnet = subnets.find(subnet => subnet.id === stake.netuid);
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
