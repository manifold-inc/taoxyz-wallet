import type { Subnet } from "../../../types/client";

interface SubnetSelectionProps {
  subnets: Subnet[];
  isLoading: boolean;
  onSelect: (subnet: Subnet) => void;
}

const SubnetSelection = ({
  subnets,
  isLoading,
  onSelect,
}: SubnetSelectionProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-[11px] font-medium mb-4">Select a Subnet</h2>
      <div className="space-y-2">
        {subnets.map((subnet) => (
          <div
            key={subnet.id}
            className="bg-white/5 rounded-lg p-3 outline outline-1 outline-black/20"
            onClick={() => onSelect(subnet)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-[13px] font-semibold">{subnet.name}</h3>
                <p className="text-[10px] text-gray-400">
                  Price: {subnet.price} TAO
                </p>
              </div>
              <button
                className="text-[10px] text-blue-500 px-4 py-1 rounded hover:bg-blue-500/10 hover:outline hover:outline-1 hover:outline-blue-500/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(subnet);
                }}
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubnetSelection;
