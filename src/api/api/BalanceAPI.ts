import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { ApiPromise } from '@polkadot/api';

const SubstrateAccountSchema = z.object({
  nonce: z.number(),
  consumers: z.number(),
  providers: z.number(),
  sufficients: z.number(),
  data: z.object({
    free: z.number(),
    reserved: z.number(),
    frozen: z.number(),
  }),
});

export const createBalanceAPI = (getApi: () => Promise<ApiPromise>) => ({
  getTotal: (address: string) => {
    return useQuery({
      queryKey: ['balance', 'total', address],
      queryFn: async () => {
        const api = await getApi();
        const result = await api.query.system.account(address);
        const account = SubstrateAccountSchema.parse(result.toJSON());
        const totalBalance = account.data.free + account.data.reserved;
        return BigInt(totalBalance);
      },
      enabled: !!address,
    });
  },

  getFree: (address: string) => {
    return useQuery({
      queryKey: ['balance', 'free', address],
      queryFn: async () => {
        const api = await getApi();
        const result = await api.query.system.account(address);
        const account = SubstrateAccountSchema.parse(result.toJSON());
        return BigInt(account.data.free);
      },
      enabled: !!address,
    });
  },
});
