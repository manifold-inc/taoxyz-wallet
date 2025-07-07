import { useQuery } from '@tanstack/react-query';

import { ApiPromise } from '@polkadot/api';

import type { Stake } from '@/types/client';

export const createStakeAPI = (getApi: () => Promise<ApiPromise>) => ({
  getAllStakes: (address: string) => {
    return useQuery({
      queryKey: ['stakes', 'all', address],
      queryFn: async () => {
        const api = await getApi();
        const result = await api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address);
        const stakes = result.toJSON() as unknown;
        if (!Array.isArray(stakes)) return [];
        return stakes as Stake[];
      },
      enabled: !!address,
    });
  },

  getStakesByValidator: (address: string, hotkey: string) => {
    return useQuery({
      queryKey: ['stakes', 'validator', address, hotkey],
      queryFn: async () => {
        const api = await getApi();
        const result = await api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address);
        const stakes = result.toJSON() as unknown;
        if (!Array.isArray(stakes)) return null;
        const allStakes = stakes as Stake[];
        return allStakes.find(stake => stake.hotkey === hotkey) || null;
      },
      enabled: !!address && !!hotkey,
    });
  },

  getStakesBySubnet: (address: string, subnetId: number) => {
    return useQuery({
      queryKey: ['stakes', 'subnet', address, subnetId],
      queryFn: async () => {
        const api = await getApi();
        const result = await api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address);
        const stakes = result.toJSON() as unknown;
        if (!Array.isArray(stakes)) return [];
        const allStakes = stakes as Stake[];
        return allStakes.filter(stake => stake.netuid === subnetId);
      },
      enabled: !!address && typeof subnetId === 'number',
    });
  },

  getStakesByValidatorAndSubnet: (address: string, hotkey: string, subnetId: number) => {
    return useQuery({
      queryKey: ['stakes', 'validator-subnet', address, hotkey, subnetId],
      queryFn: async () => {
        const api = await getApi();
        const result = await api.call.stakeInfoRuntimeApi.getStakeInfoForColdkey(address);
        const stakes = result.toJSON() as unknown;
        if (!Array.isArray(stakes)) return null;
        const allStakes = stakes as Stake[];
        return (
          allStakes.find(stake => stake.hotkey === hotkey && stake.netuid === subnetId) || null
        );
      },
      enabled: !!address && !!hotkey && typeof subnetId === 'number',
    });
  },
});
