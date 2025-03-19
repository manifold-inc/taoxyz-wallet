import { createContext, useContext, useEffect, useState } from "react";
import PolkadotApi from "../api/polkadotApi";

interface ApiContext {
  api: PolkadotApi | null;
  isLoading: boolean;
  error: Error | null;
  setEndpoint: (endpoint: "test" | "main") => Promise<PolkadotApi>;
}

const PolkadotApiContext = createContext<ApiContext>({
  api: null,
  isLoading: true,
  error: null,
  setEndpoint: async () => {
    throw new Error("Context cannot be used outside of the provider");
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

  useEffect(() => {
    init();
    return () => {
      if (api) api.disconnect();
    };
  }, []);

  const init = async (endpoint?: "test" | "main"): Promise<PolkadotApi> => {
    setIsLoading(true);
    try {
      if (!api) {
        const reqApi = new PolkadotApi(endpoint ?? "test");
        await reqApi.getApi();
        setApi(reqApi);
        return reqApi;
      }

      if (endpoint) await api.changeEndpoint(endpoint);
      return api;
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      } else {
        setError(new Error("Failed to initialize Polkadot API"));
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PolkadotApiContext.Provider
      value={{ api, isLoading, error, setEndpoint: init }}
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
