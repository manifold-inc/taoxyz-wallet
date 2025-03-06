import { createContext, useContext, useEffect, useState } from "react";
import { RpcApi } from "../api/RpcApi";

interface RpcApiContextType {
  api: RpcApi | null;
  isLoading: boolean;
  error: Error | null;
  setEndpoint: (endpoint: "test" | "main") => void;
}

const RpcApiContext = createContext<RpcApiContextType>({
  api: null,
  isLoading: true,
  error: null,
  setEndpoint: () => {},
});

export const RpcApiProvider = ({ children }: { children: React.ReactNode }) => {
  const [api, setApi] = useState<RpcApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [endpoint, setEndpoint] = useState<"test" | "main">("test");

  useEffect(() => {
    const initApi = async () => {
      setIsLoading(true);
      const newApi = new RpcApi(endpoint);
      await newApi.getApi();
      setApi(newApi);
      setIsLoading(false);
    };
    initApi();
  }, []);

  const handleEndpointChange = async (newEndpoint: "test" | "main") => {
    if (!api) return;
    setIsLoading(true);
    try {
      await api.changeEndpoint(newEndpoint);
      setEndpoint(newEndpoint);
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error("Failed to change endpoint")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RpcApiContext.Provider
      value={{ api, isLoading, error, setEndpoint: handleEndpointChange }}
    >
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
