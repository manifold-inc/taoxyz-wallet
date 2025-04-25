import type { Transition } from 'framer-motion';

// shippable transition generator
export const stg = (skip: boolean) => {
  return (tx: Transition) => {
    return {
      key: `${skip}-${JSON.stringify(tx)}`,
      transition: skip ? {} : tx,
    };
  };
};
