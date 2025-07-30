import { type ReactNode, createContext, useContext, useState } from 'react';

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
  setDashboardState: (state: DashboardState) => void;
  resetDashboardState: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [dashboardState, setDashboardState] = useState<DashboardState>(DashboardState.OVERVIEW);

  const resetDashboardState = () => {
    setDashboardState(DashboardState.OVERVIEW);
  };

  return (
    <DashboardContext.Provider
      value={{
        dashboardState,
        setDashboardState,
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
