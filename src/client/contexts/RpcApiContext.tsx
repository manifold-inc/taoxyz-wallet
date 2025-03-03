import { createContext, useContext, useEffect, useState } from "react";
import { RpcApi } from "../api/RpcApi";

interface RpcApiContextType {
  api: RpcApi | null;
  isLoading: boolean;
  error: Error | null;
}

const RpcApiContext = createContext<RpcApiContextType>({
  api: null,
  isLoading: true,
  error: null,
});

export const RpcApiProvider = ({ children }: { children: React.ReactNode }) => {
  const [api, setApi] = useState<RpcApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const rpcApi = new RpcApi();
        await rpcApi.getApi();
        setApi(rpcApi);
      } catch (error) {
        setError(
          error instanceof Error ? error : new Error("Failed to initialize")
        );
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  return (
    <RpcApiContext.Provider value={{ api, isLoading, error }}>
      {children}
    </RpcApiContext.Provider>
  );
};

export const useRpcApi = () => {
  const context = useContext(RpcApiContext);
  if (context === undefined) {
    throw new Error("useRpcApi must be used within a RpcApiProvider");
  }
  return context;
};
