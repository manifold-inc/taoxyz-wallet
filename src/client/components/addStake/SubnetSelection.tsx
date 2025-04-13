import { motion } from 'framer-motion';

import { useState } from 'react';

import { useNotification } from '@/client/contexts/NotificationContext';
import { usePolkadotApi } from '@/client/contexts/PolkadotApiContext';
import type { Subnet, Validator } from '@/types/client';
import { NotificationType } from '@/types/client';

interface SubnetSelectionProps {
  subnets: Subnet[];
  isLoadingSubnets: boolean;
  onSelect: (subnet: Subnet) => void;
}

const SubnetSelection = ({ subnets, isLoadingSubnets = true, onSelect }: SubnetSelectionProps) => {
  const { api } = usePolkadotApi();
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [validators, setValidators] = useState<Validator[]>([]);
  const [isLoadingValidators, setIsLoadingValidators] = useState(false);

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
      setValidators(validators);
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
    onSelect(subnet);
    getValidators(subnet.id);
  };

  console.log(validators, isLoadingValidators, isLoadingSubnets);

  return (
    <div className="w-full h-full flex flex-col gap-3 px-5 py-3">
      {/* Search */}
      <input
        type="text"
        placeholder="Search Subnets"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full p-2 text-sm text-mf-edge-500 placeholder-mf-edge-500 bg-mf-night-300 rounded-md"
      />

      {/* Subnets */}
      <div className="flex flex-col gap-3">
        {filteredSubnets.map(subnet => (
          <motion.button
            key={subnet.id}
            onClick={() => handleSubnetSelect(subnet)}
            className="w-full text-left rounded-md cursor-pointer p-3 bg-mf-ash-500 hover:bg-mf-ash-300 transition-colors gap-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <p className="font-semibold text-mf-edge-500 text-sm truncate max-w-[10ch]">
                  {subnet.name}
                </p>
                <span className="font-semibold text-mf-edge-700 text-sm">{`SN${subnet.id}`}</span>
              </div>
              <span className="text-mf-edge-500 text-sm">{subnet.id === 0 ? 'τ' : 'α'}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-mf-sybil-500 text-sm">Price</p>
              <p className="text-mf-edge-500 text-sm">{subnet.price}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SubnetSelection;
