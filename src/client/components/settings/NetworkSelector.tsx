interface NetworkSelectorProps {
  selectedNetwork: "test" | "main";
  onNetworkChange: (network: "test" | "main") => void;
}

const NetworkSelector = ({
  selectedNetwork,
  onNetworkChange,
}: NetworkSelectorProps) => {
  return (
    <div className="w-full px-3 py-2 rounded-lg bg-mf-ash-500">
      <h3 className="text-sm font-medium text-mf-silver-300 mb-2">Network</h3>
      <div className="flex gap-2">
        <button
          onClick={() => onNetworkChange("main")}
          className={`flex-1 text-xs rounded-lg px-4 py-2 transition-colors ${
            selectedNetwork === "main"
              ? "bg-mf-sybil-500 text-mf-ash-500 hover:bg-mf-sybil-700"
              : "bg-mf-ash-300 text-mf-silver-300 hover:bg-mf-ash-400 hover:text-mf-milk-300"
          }`}
        >
          Mainnet
        </button>
        <button
          onClick={() => onNetworkChange("test")}
          className={`flex-1 text-xs rounded-lg px-4 py-2 transition-colors ${
            selectedNetwork === "test"
              ? "bg-mf-sybil-500 text-mf-ash-500 hover:bg-mf-sybil-700"
              : "bg-mf-ash-300 text-mf-silver-300 hover:bg-mf-ash-400 hover:text-mf-milk-300"
          }`}
        >
          Testnet
        </button>
      </div>
    </div>
  );
};

export default NetworkSelector;
