import { useQuery } from '@tanstack/react-query';

import { ApiPromise } from '@polkadot/api';

interface BittensorMetagraph {
  coldkeys: string[];
  hotkeys: string[];
  active: boolean[];
  validatorPermit: boolean[];
  identities?: ({ name?: string } | null)[];
  stake?: number[];
  trust?: number[];
  consensus?: number[];
  incentive?: number[];
  dividends?: number[];
  emission?: number[];
  vtrust?: number[];
  lastUpdate?: number[];
}

export const createValidatorsAPI = (getApi: () => Promise<ApiPromise>) => ({
  getAllValidators: (
    subnetId: number | undefined,
    options?: { onError?: (error: Error) => void }
  ) => {
    return useQuery({
      queryKey: ['validators', 'all', subnetId],
      queryFn: async () => {
        if (subnetId == null) {
          throw new Error('Subnet ID is required');
        }

        const api = await getApi();
        const result = await api.call.subnetInfoRuntimeApi.getMetagraph(subnetId);
        const btMetagraph = result.toJSON() as unknown as BittensorMetagraph;

        if (
          !btMetagraph ||
          !btMetagraph.coldkeys ||
          !btMetagraph.active ||
          !btMetagraph.validatorPermit
        ) {
          throw new Error('Failed to get validators');
        }

        const validators = [];
        for (let i = 0; i < btMetagraph.coldkeys.length; i++) {
          if (btMetagraph.active[i] === true && btMetagraph.validatorPermit[i] === true) {
            let name = null;
            const identity = btMetagraph.identities?.[i];
            if (identity?.name) {
              try {
                const hexString = identity.name.replace('0x', '');
                const bytes = new Uint8Array(
                  hexString.match(/.{1,2}/g)?.map((byte: string) => parseInt(byte, 16)) || []
                );
                name = new TextDecoder().decode(bytes);
              } catch (error) {
                console.warn('Failed to decode validator name:', error);
                name = `Validator ${btMetagraph.hotkeys[i]?.slice(0, 8)}...`;
              }
            }

            validators.push({
              index: i,
              hotkey: btMetagraph.hotkeys[i] || 'unknown',
              coldkey: btMetagraph.coldkeys[i] || 'unknown',
              name: name || `Validator ${btMetagraph.hotkeys[i]?.slice(0, 8)}...`,
              uid: i,
              stake: btMetagraph.stake?.[i] || 0,
              trust: btMetagraph.trust?.[i] || 0,
              consensus: btMetagraph.consensus?.[i] || 0,
              incentive: btMetagraph.incentive?.[i] || 0,
              dividends: btMetagraph.dividends?.[i] || 0,
              emission: btMetagraph.emission?.[i] || 0,
              vtrust: btMetagraph.vtrust?.[i] || 0,
              lastUpdate: btMetagraph.lastUpdate?.[i] || 0,
              validatorPermit: btMetagraph.validatorPermit[i] || false,
            });
          }
        }

        return validators;
      },
      enabled: subnetId != null && typeof subnetId === 'number' && subnetId >= 0,
      staleTime: 600000,
      ...options,
    });
  },
});
