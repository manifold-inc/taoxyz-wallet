import { useState } from 'react';

import SubnetSelection from '@/client/components/common/SubnetSelection';
import Transaction, { TransactionType } from '@/client/components/common/Transaction';
import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import { useWallet } from '@/client/contexts/WalletContext';
import type { Subnet, Validator } from '@/types/client';
import { NotificationType } from '@/types/client';

enum Step {
  SELECT_SUBNET,
  TRANSACTION,
}

// TODO: Potentially pass in subnets depending on navigation
const CreateStake = () => {
  const { api } = usePolkadotApi();
  const { showNotification } = useNotification();
  const { currentAddress } = useWallet();
  const [step, setStep] = useState<Step>(Step.SELECT_SUBNET);

  const [subnets, setSubnets] = useState<Subnet[]>([]);
  const [selectedSubnet, setSelectedSubnet] = useState<Subnet | null>(null);
  const [validators, setValidators] = useState<Validator[]>([]);
  const [freeBalance, setFreeBalance] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const getFreeBalance = async () => {
    if (!api || !currentAddress) return;
    try {
      setIsLoading(true);
      const freeBalance = await api.getBalance(currentAddress);
      if (freeBalance === null) {
        showNotification({
          type: NotificationType.Error,
          message: 'Failed to Fetch Free Balance',
        });
      }
      setFreeBalance(freeBalance);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubnetSelect = (subnet: Subnet, validators: Validator[]) => {
    setSelectedSubnet(subnet);
    setValidators(validators);
    setStep(Step.TRANSACTION);
  };

  const init = async () => {
    if (isInitialized || !api) return;
    setIsInitialized(true);
    await Promise.all([getSubnets(), getFreeBalance()]);
  };

  void init();

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
        return (
          <Transaction
            address={currentAddress as string}
            subnet={selectedSubnet as Subnet}
            validators={validators}
            balance={freeBalance as number}
            transactionType={TransactionType.CREATE_STAKE}
          />
        );
    }
  };

  return <div className="w-full h-full">{renderContent()}</div>;
};

export default CreateStake;
