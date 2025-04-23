import { motion } from 'framer-motion';

import { useState } from 'react';

import Skeleton from '@/client/components/common/Skeleton';
import { DashboardState, useDashboard } from '@/client/contexts/DashboardContext';
import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import type { Subnet, Validator } from '@/types/client';
import { NotificationType } from '@/types/client';

interface SubnetSelectionProps {
  subnets: Subnet[];
  toSubnet: Subnet | null;
  isLoadingSubnets: boolean;
  setToSubnet: (subnet: Subnet) => void;
  onCancel: () => void;
  onConfirm: (subnet: Subnet, validators: Validator[]) => void;
}

const SubnetSkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      {/* Subnets Skeleton */}
      {[1, 2, 3].map(index => (
        <div key={index} className="flex flex-col gap-3">
          <div className="w-full rounded-md p-3 bg-mf-ash-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// TODO: Better styling
const ValidatorSkeleton = () => {
  return <Skeleton className="h-4 w-8 bg-mf-ash-500" />;
};

const SubnetSelection = ({
  subnets,
  toSubnet,
  isLoadingSubnets = true,
  setToSubnet,
  onCancel,
  onConfirm,
}: SubnetSelectionProps) => {
  const { api } = usePolkadotApi();
  const { showNotification } = useNotification();
  const {
    dashboardSubnet,
    dashboardValidators,
    dashboardState,
    setDashboardSubnet,
    setDashboardValidators,
  } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingValidators, setIsLoadingValidators] = useState(false);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(() => {
    if (dashboardState === DashboardState.MOVE_STAKE) {
      return toSubnet;
    }
    return dashboardSubnet;
  });

  const getValidators = async (subnetId: number) => {
    if (!api) return;
    try {
      setIsLoadingValidators(true);
      const validators = await api.getValidators(subnetId);
      if (validators === null) {
        showNotification({
          type: NotificationType.Error,
          message: 'Failed to Fetch Validators',
        });
        return;
      }
      setDashboardValidators(validators);
    } finally {
      setIsLoadingValidators(false);
    }
  };

  const filteredSubnets = subnets.filter(subnet => {
    const query = searchQuery.toLowerCase();
    const subnetName = subnet.name.toLowerCase();
    const subnetId = `SN${subnet.id}`.toLowerCase();
    return subnetName.includes(query) || subnetId.includes(query);
  });

  const handleSubnetSelect = (subnet: Subnet) => {
    if (subnet.id === selectedSubnet?.id) return;
    setSelectedSubnet(subnet);
    getValidators(subnet.id);
  };

  const handleConfirm = () => {
    if (!selectedSubnet || !dashboardValidators) return;
    if (dashboardState === DashboardState.MOVE_STAKE) {
      setToSubnet(selectedSubnet);
    } else {
      setDashboardSubnet(selectedSubnet);
    }
    onConfirm(selectedSubnet, dashboardValidators);
  };

  return (
    <div className="w-full h-full flex flex-col gap-3">
      {/* Search */}
      <div className="flex items-center gap-2">
        <motion.input
          type="text"
          placeholder="Search Subnets"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-4/5 p-2 text-sm text-mf-edge-500 border border-mf-ash-500 placeholder:text-mf-edge-700 bg-mf-night-300 rounded-md focus:outline-none"
          whileFocus={{
            borderColor: '#57E8B4',
          }}
        />
        {searchQuery !== '' ? (
          <button
            onClick={() => setSearchQuery('')}
            className="text-mf-sybil-500 text-sm w-1/5 bg-mf-ash-500 rounded-md border border-mf-ash-500 p-2 cursor-pointer hover:opacity-50"
          >
            Clear
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="text-mf-red-500 text-sm w-1/5 bg-mf-red-opacity rounded-md border border-mf-red-opacity p-2 cursor-pointer hover:opacity-50"
          >
            Back
          </button>
        )}
      </div>

      {/* Subnets */}
      {isLoadingSubnets ? (
        <SubnetSkeleton />
      ) : (
        <div className="flex flex-col gap-3">
          {filteredSubnets.map(subnet => (
            <div className="flex flex-col gap-3" key={subnet.id}>
              {/* Subnet */}
              <button
                onClick={() => handleSubnetSelect(subnet)}
                className={`w-full text-left rounded-md cursor-pointer p-2 gap-1 hover:bg-mf-ash-300 ${
                  selectedSubnet?.id === subnet.id ? 'bg-mf-ash-300' : 'bg-mf-ash-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-mf-edge-500 text-sm truncate max-w-[10ch]">
                      {subnet.name}
                    </p>
                    <span className="font-semibold text-mf-edge-700 text-sm">{`SN${subnet.id}`}</span>
                  </div>
                  <span className="text-mf-edge-500 text-sm">
                    {subnet.price}
                    {subnet.id === 0 ? ' τ' : ' α'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-mf-sybil-500 text-sm">Validators</p>
                  {/* Validators */}
                  {selectedSubnet?.id === subnet.id &&
                    (isLoadingValidators ? (
                      <ValidatorSkeleton />
                    ) : (
                      <p className="text-mf-edge-500 text-sm">{dashboardValidators?.length ?? 0}</p>
                    ))}
                </div>
              </button>

              {/* Action Buttons */}
              {selectedSubnet?.id === subnet.id && (
                <div className="flex gap-2">
                  <button
                    onClick={onCancel}
                    className="rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-red-opacity border border-mf-red-opacity hover:opacity-50 text-mf-red-500 gap-1"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleConfirm}
                    className="rounded-md text-center cursor-pointer w-1/2 py-1.5 bg-mf-sybil-opacity border border-mf-sybil-opacity hover:opacity-50 text-mf-sybil-500 gap-1 disabled:disabled-button disabled:cursor-not-allowed"
                    disabled={
                      selectedSubnet === null ||
                      dashboardValidators === null ||
                      dashboardValidators.length === 0
                    }
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubnetSelection;
