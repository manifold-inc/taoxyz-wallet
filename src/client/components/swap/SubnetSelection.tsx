import type { Subnet } from "../../../types/client";

interface SubnetSelectionProps {
  subnets: Subnet[];
  isLoading: boolean;
  selectedSubnet: Subnet | null;
  onSelect: (subnet: Subnet) => void;
}

const SubnetSelection = ({
  subnets,
  isLoading,
  selectedSubnet,
  onSelect,
}: SubnetSelectionProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-milk-300" />
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {subnets.map((subnet) => {
        const isSelected = selectedSubnet?.id === subnet.id;
        return (
          <div
            key={subnet.id}
            className={`w-full rounded-lg ${
              isSelected
                ? "bg-mf-ash-400 ring-1 ring-mf-safety-300"
                : "bg-mf-ash-300 hover:bg-mf-ash-400"
            } transition-colors px-3 py-2 cursor-pointer`}
            onClick={() => onSelect(subnet)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xs font-semibold text-mf-milk-300">
                  {subnet.name}
                </h3>
                <p className="text-xs text-mf-silver-300">
                  Price: {subnet.price} τ
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubnetSelection;
