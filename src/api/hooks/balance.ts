import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { apiManager } from '@/api/api';

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
  flags: z.array(z.number()),
});

export const balance = {
  useTotalBalance: (address: string) => {
    return useQuery({
      queryKey: ['balance', 'total', address],
      queryFn: async () => {
        const api = await apiManager.getApi();
        const result = await api.query.system.account(address);

        const account = SubstrateAccountSchema.parse(result.toJSON());
        const totalBalance = account.data.free + account.data.reserved;

        return { balance: BigInt(totalBalance), success: true };
      },
      enabled: !!address,
    });
  },
};
