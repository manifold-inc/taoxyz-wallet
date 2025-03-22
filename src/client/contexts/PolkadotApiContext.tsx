import { createContext, useContext, useEffect, useState } from "react";
import PolkadotApi from "../api/PolkadotApi";

interface ApiContext {
  api: PolkadotApi | null;
  isLoading: boolean;
  error: Error | null;
}

const PolkadotApiContext = createContext<ApiContext>({
  api: null,
  isLoading: true,
  error: null,
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

  const init = async (): Promise<PolkadotApi> => {
    setIsLoading(true);
    try {
      if (!api) {
        const reqApi = PolkadotApi.getInstance();
        await reqApi.getApi();
        setApi(reqApi);
        return reqApi;
      }

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
    <PolkadotApiContext.Provider value={{ api, isLoading, error }}>
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
