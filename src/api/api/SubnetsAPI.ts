import { useQuery } from '@tanstack/react-query';

import { ApiPromise } from '@polkadot/api';

import type { BittensorSubnet } from '@/types/client';
import { calculateSubnetPrice } from '@/utils/utils';

export const createSubnetsAPI = (getApi: () => Promise<ApiPromise>) => ({
  getAll: () => {
    return useQuery({
      queryKey: ['subnets', 'all'],
      queryFn: async () => {
        const api = await getApi();
        const result = await api.call.subnetInfoRuntimeApi.getAllDynamicInfo();
        const btSubnetsRaw = result.toJSON() as unknown;
        if (!Array.isArray(btSubnetsRaw)) return [];
        const btSubnets = btSubnetsRaw
          .map(btSubnet => {
            if (!btSubnet) return null;
            const subnetName = btSubnet.subnetIdentity?.subnetName
              ? new TextDecoder('utf-8').decode(
                  Uint8Array.from(
                    btSubnet.subnetIdentity.subnetName
                      ?.match(/.{1,2}/g)
                      ?.map((b: string) => parseInt(b, 16)) || []
                  )
                )
              : `Subnet ${btSubnet.netuid}`;
            const price = calculateSubnetPrice(btSubnet.netuid, btSubnet.taoIn, btSubnet.alphaIn);
            const tokenSymbol = btSubnet.tokenSymbol
              ? String.fromCharCode(...btSubnet.tokenSymbol)
              : 'TAO';
            return {
              ...btSubnet,
              id: btSubnet.netuid,
              name: subnetName,
              price: price,
              tokenSymbol: tokenSymbol,
            };
          })
          .filter(subnet => subnet !== null);
        return btSubnets;
      },
    });
  },

  getOne: (subnetId: number) => {
    return useQuery({
      queryKey: ['subnets', 'one', subnetId],
      queryFn: async () => {
        const api = await getApi();
        const result = await api.call.subnetInfoRuntimeApi.getDynamicInfo(subnetId);
        const btSubnet = result.toJSON() as unknown as BittensorSubnet;
        if (!btSubnet) throw new Error('Subnet not found');

        const subnetName = btSubnet.subnetIdentity.subnetName
          ? String.fromCharCode(...btSubnet.subnetName)
          : `Subnet ${btSubnet.netuid}`;
        const price = calculateSubnetPrice(btSubnet.netuid, btSubnet.taoIn, btSubnet.alphaIn);
        const tokenSymbol = btSubnet.tokenSymbol
          ? String.fromCharCode(...btSubnet.tokenSymbol)
          : 'TAO';

        return {
          ...btSubnet,
          id: btSubnet.netuid,
          name: subnetName,
          price: price,
          tokenSymbol: tokenSymbol,
        };
      },
      enabled: typeof subnetId === 'number',
    });
  },
});
