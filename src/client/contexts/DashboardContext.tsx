import { type ReactNode, createContext, useContext, useState } from 'react';

import type { Subnet, Validator } from '@/types/client';

export enum DashboardState {
  OVERVIEW = 'OVERVIEW',
  CREATE_STAKE = 'CREATE_STAKE',
  ADD_STAKE = 'ADD_STAKE',
  REMOVE_STAKE = 'REMOVE_STAKE',
  MOVE_STAKE = 'MOVE_STAKE',
  TRANSFER = 'TRANSFER',
}

export interface PreselectedData {
  subnet: Subnet | null;
  validator: Validator | null;
}

export interface DashboardContextType {
  dashboardState: DashboardState;
  setDashboardState: (state: DashboardState, preselectedData?: PreselectedData) => void;
  resetDashboardState: () => void;
  preselectedData: PreselectedData;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [dashboardState, setDashboardState] = useState<DashboardState>(DashboardState.OVERVIEW);
  const [preselectedData, setPreselectedData] = useState<PreselectedData>({
    subnet: null,
    validator: null,
  });

  const resetDashboardState = () => {
    setDashboardState(DashboardState.OVERVIEW);
    setPreselectedData({ subnet: null, validator: null });
  };

  const handleSetDashboardState = (state: DashboardState, preselectedData?: PreselectedData) => {
    setDashboardState(state);
    if (preselectedData) {
      setPreselectedData(preselectedData);
    } else {
      setPreselectedData({ subnet: null, validator: null });
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardState,
        setDashboardState: handleSetDashboardState,
        resetDashboardState,
        preselectedData,
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
