import { useQuery } from '@tanstack/react-query';

import { ApiPromise } from '@polkadot/api';

export const createValidatorsAPI = (getApi: () => Promise<ApiPromise>) => ({
  getAllValidators: (subnetId: number) => {
    return useQuery({
      queryKey: ['validators', 'all', subnetId],
      queryFn: async () => {
        const api = await getApi();
        const result = await api.call.subnetInfoRuntimeApi.getValidators(subnetId);
        const validatorsRaw = result.toJSON() as unknown;
        if (!Array.isArray(validatorsRaw)) return [];

        const validators = validatorsRaw
          .map(validator => {
            if (!validator) return null;

            // Extract validator name from identity if available
            const validatorName = validator.validatorIdentity?.validatorName
              ? new TextDecoder('utf-8').decode(
                  Uint8Array.from(
                    validator.validatorIdentity.validatorName
                      ?.match(/.{1,2}/g)
                      ?.map((b: string) => parseInt(b, 16)) || []
                  )
                )
              : `Validator ${validator.hotkey?.slice(0, 8)}...`;

            return {
              ...validator,
              name: validatorName,
              hotkey: validator.hotkey,
              coldkey: validator.coldkey,
              uid: validator.uid,
              stake: validator.stake,
              trust: validator.trust,
              consensus: validator.consensus,
              incentive: validator.incentive,
              dividends: validator.dividends,
              emission: validator.emission,
              vtrust: validator.vtrust,
              lastUpdate: validator.lastUpdate,
              validatorPermit: validator.validatorPermit,
            };
          })
          .filter(validator => validator !== null);

        return validators;
      },
      enabled: typeof subnetId === 'number' && subnetId >= 0,
    });
  },

  getOneValidator: (subnetId: number, hotkey: string) => {
    return useQuery({
      queryKey: ['validators', 'one', subnetId, hotkey],
      queryFn: async () => {
        const api = await getApi();
        const result = await api.call.subnetInfoRuntimeApi.getValidators(subnetId);
        const validatorsRaw = result.toJSON() as unknown;
        if (!Array.isArray(validatorsRaw)) return null;

        const validator = validatorsRaw.find(v => v?.hotkey === hotkey);
        if (!validator) return null;

        const validatorName = validator.validatorIdentity?.validatorName
          ? new TextDecoder('utf-8').decode(
              Uint8Array.from(
                validator.validatorIdentity.validatorName
                  ?.match(/.{1,2}/g)
                  ?.map((b: string) => parseInt(b, 16)) || []
              )
            )
          : `Validator ${validator.hotkey?.slice(0, 8)}...`;

        return {
          ...validator,
          name: validatorName,
          hotkey: validator.hotkey,
          coldkey: validator.coldkey,
          uid: validator.uid,
          stake: validator.stake,
          trust: validator.trust,
          consensus: validator.consensus,
          incentive: validator.incentive,
          dividends: validator.dividends,
          emission: validator.emission,
          vtrust: validator.vtrust,
          lastUpdate: validator.lastUpdate,
          validatorPermit: validator.validatorPermit,
        };
      },
      enabled: typeof subnetId === 'number' && subnetId >= 0 && !!hotkey,
    });
  },
});
