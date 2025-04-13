import { useState } from 'react';

import SubnetSelection from '@/client/components/addStake/SubnetSelection';
import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import type { Subnet } from '@/types/client';
import { NotificationType } from '@/types/client';

enum Step {
  SELECT_SUBNET,
  TRANSACTION,
}

// TODO: Potentially pass in subnets depending on navigation
// TODO: Component vs page
const CreateStake = () => {
  const { api } = usePolkadotApi();
  const { showNotification } = useNotification();
  const [step, setStep] = useState<Step>(Step.SELECT_SUBNET);
  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getSubnets = async () => {
    if (!api) return;
    try {
      setIsLoading(true);
      const subnets = await api.getSubnets();
      if (subnets === null) {
        showNotification({
          type: NotificationType.Error,
          message: 'Failed to Load Subnets',
        });
        return;
      }
      setSubnets(subnets);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubnetSelect = (subnet: Subnet) => {
    setSelectedSubnet(subnet);
    setStep(Step.TRANSACTION);
  };

  if (!isInitialized) {
    getSubnets();
    setIsInitialized(true);
  }

  console.log(selectedSubnet);

  const renderContent = () => {
    switch (step) {
      case Step.SELECT_SUBNET:
        return (
          <SubnetSelection
            subnets={subnets}
            isLoadingSubnets={isLoading}
            onSelect={handleSubnetSelect}
          />
        );
      case Step.TRANSACTION:
        return <div>transaction</div>;
    }
  };

  return <div className="w-full h-full">{renderContent()}</div>;
};

export default CreateStake;
