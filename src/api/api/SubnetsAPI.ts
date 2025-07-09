import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { ApiPromise } from '@polkadot/api';

import { calculateSubnetPrice } from '@/utils/utils';

const BittensorSubnetSchema = z.object({
  netuid: z.number(),
  ownerHotkey: z.string(),
  ownerColdkey: z.string(),
  subnetName: z.array(z.number()),
  tokenSymbol: z.array(z.number()),
  tempo: z.number(),
  lastStep: z.number(),
  blocksSinceLastStep: z.number(),
  emission: z.number(),
  taoIn: z.number(),
  subnetIdentity: z.object({
    subnetName: z.array(z.number()),
    githubRepo: z.string(),
    subnetContact: z.string(),
    subnetUrl: z.string(),
    discord: z.string(),
    description: z.string(),
    additional: z.string().optional(),
  }),
  alphaIn: z.number(),
  alphaOut: z.number(),
  alphaOutEmission: z.number(),
  alphaInEmission: z.number(),
  taoInEmission: z.number(),
  pendingAlphaEmission: z.number(),
  pendingRootEmission: z.number(),
});

export const createSubnetsAPI = (getApi: () => Promise<ApiPromise>) => ({
  getAll: () => {
    return useQuery({
      queryKey: ['subnets', 'all'],
      queryFn: async () => {
        const api = await getApi();
        const result = await api.call.subnetInfoRuntimeApi.getAllDynamicInfo();
        const data = BittensorSubnetSchema.array().parse(result.toJSON());
        if (!Array.isArray(data)) throw new Error('Failed to parse data');

        const btSubnets = data
          .map(btSubnet => {
            if (!btSubnet) return null;
            const subnetName = btSubnet.subnetIdentity.subnetName
              ? String.fromCharCode(...btSubnet.subnetIdentity.subnetName)
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
        const btSubnet = BittensorSubnetSchema.parse(result.toJSON());
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
