import { type ReactNode, createContext, useContext, useState } from 'react';

import { type Stake, type Subnet, type Validator } from '@/types/client';

export enum DashboardState {
  OVERVIEW = 'OVERVIEW',
  CREATE_STAKE = 'CREATE_STAKE',
  ADD_STAKE = 'ADD_STAKE',
  REMOVE_STAKE = 'REMOVE_STAKE',
  MOVE_STAKE = 'MOVE_STAKE',
  TRANSFER = 'TRANSFER',
}

export interface DashboardContextType {
  dashboardState: DashboardState;
  dashboardStake: Stake | null;
  dashboardStakes: Stake[] | null;
  dashboardFreeBalance: bigint | null;
  dashboardTotalBalance: bigint | null;
  dashboardSubnet: Subnet | null;
  dashboardSubnets: Subnet[] | null;
  dashboardValidator: Validator | null;
  dashboardValidators: Validator[] | null;
  setDashboardState: (state: DashboardState) => void;
  setDashboardStake: (stake: Stake | null) => void;
  setDashboardStakes: (stakes: Stake[] | null) => void;
  setDashboardFreeBalance: (balance: bigint | null) => void;
  setDashboardTotalBalance: (balance: bigint | null) => void;
  setDashboardSubnet: (subnet: Subnet | null) => void;
  setDashboardSubnets: (subnets: Subnet[] | null) => void;
  setDashboardValidator: (validator: Validator | null) => void;
  setDashboardValidators: (validators: Validator[] | null) => void;
  resetDashboardState: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [dashboardState, setDashboardState] = useState<DashboardState>(DashboardState.OVERVIEW);
  const [dashboardStake, setDashboardStake] = useState<Stake | null>(null);
  const [dashboardStakes, setDashboardStakes] = useState<Stake[] | null>(null);
  const [dashboardFreeBalance, setDashboardFreeBalance] = useState<bigint | null>(null);
  const [dashboardTotalBalance, setDashboardTotalBalance] = useState<bigint | null>(null);
  const [dashboardSubnet, setDashboardSubnet] = useState<Subnet | null>(null);
  const [dashboardSubnets, setDashboardSubnets] = useState<Subnet[] | null>(null);
  const [dashboardValidator, setDashboardValidator] = useState<Validator | null>(null);
  const [dashboardValidators, setDashboardValidators] = useState<Validator[] | null>(null);

  const resetDashboardState = () => {
    setDashboardState(DashboardState.OVERVIEW);
    setDashboardStake(null);
    setDashboardSubnet(null);
    setDashboardValidator(null);
    setDashboardValidators(null);
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardState,
        dashboardStake,
        dashboardStakes,
        dashboardFreeBalance,
        dashboardTotalBalance,
        dashboardSubnet,
        dashboardSubnets,
        dashboardValidator,
        dashboardValidators,
        setDashboardState,
        setDashboardStake,
        setDashboardStakes,
        setDashboardFreeBalance,
        setDashboardTotalBalance,
        setDashboardSubnet,
        setDashboardSubnets,
        setDashboardValidator,
        setDashboardValidators,
        resetDashboardState,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
