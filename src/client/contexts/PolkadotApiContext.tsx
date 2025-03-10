import { createContext, useContext, useEffect, useState } from "react";
import PolkadotApi from "../api/polkadotApi";

interface PolkadotApiContextType {
  api: PolkadotApi | null;
  isLoading: boolean;
  error: Error | null;
  setEndpoint: (endpoint: "test" | "main") => Promise<PolkadotApi>;
}

const PolkadotApiContext = createContext<PolkadotApiContextType>({
  api: null,
  isLoading: true,
  error: null,
  setEndpoint: async (endpoint: "test" | "main") => {
    const api = new PolkadotApi(endpoint);
    await api.getApi();
    return api;
  },
});

export const PolkadotApiProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [api, setApi] = useState<PolkadotApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [endpoint, setEndpoint] = useState<"test" | "main">("test");

  useEffect(() => {
    const initApi = async () => {
      setIsLoading(true);
      const newApi = new PolkadotApi(endpoint);
      await newApi.getApi();
      setApi(newApi);
      setIsLoading(false);
    };
    initApi();
  }, []);

  const handleEndpointChange = async (newEndpoint: "test" | "main") => {
    if (!api) {
      const newApi = new PolkadotApi(newEndpoint);
      await newApi.getApi();
      setApi(newApi);
      return newApi;
    }
    setIsLoading(true);
    try {
      await api.changeEndpoint(newEndpoint);
      setEndpoint(newEndpoint);
      return api;
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error("Failed to change endpoint")
      );
      return api;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PolkadotApiContext.Provider
      value={{ api, isLoading, error, setEndpoint: handleEndpointChange }}
    >
      {children}
    </PolkadotApiContext.Provider>
  );
};

export const usePolkadotApi = () => {
  const context = useContext(PolkadotApiContext);
  if (context === undefined) {
    throw new Error("usePolkadotApi must be used within a PolkadotApiProvider");
  }
  return context;
};
