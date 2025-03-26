import type { Subnet, Validator } from "../../../types/client";

interface SubnetSelectionProps {
  subnets: Subnet[];
  selectedSubnet: Subnet | null;
  validators: Validator[];
  isLoadingSubnets: boolean;
  isLoadingValidators: boolean;
  onSelect: (subnet: Subnet) => void;
}

const SubnetSelection = ({
  subnets,
  selectedSubnet,
  isLoadingSubnets,
  validators,
  isLoadingValidators,
  onSelect,
}: SubnetSelectionProps) => {
  if (isLoadingSubnets) {
    return (
      <div className="flex justify-center items-center h-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-mf-milk-300" />
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {subnets.map((subnet) => {
        const isSelected = selectedSubnet?.id === subnet.id;
        return (
          <button
            key={subnet.id}
            onClick={() => onSelect(subnet)}
            className={`w-full text-left border-sm p-2 border-2 border-mf-ash-500 ${
              isSelected
                ? "bg-mf-ash-300 border-mf-safety-500"
                : "bg-mf-ash-500 hover:bg-mf-ash-300"
            } transition-colors space-y-1`}
          >
            <div className="flex items-center justify-between text-sm">
              <h3 className="font-semibold text-mf-silver-300 flex items-center">
                <span className="truncate w-16">{subnet.name}</span>
                {isSelected && (
                  <span
                    className={`ml-2 text-xs ${
                      !isLoadingValidators && validators.length > 0
                        ? "text-mf-sybil-500"
                        : "text-mf-safety-500"
                    }`}
                  >
                    {isLoadingValidators
                      ? "Loading..."
                      : validators.length === 0
                      ? "0 Validators"
                      : `${validators.length} Validators`}
                  </span>
                )}
              </h3>
              <span className="text-mf-safety-500">α</span>
            </div>
            <div className="flex items-center justify-between text-sm text-mf-milk-300">
              <p>Subnet {subnet.id}</p>
              <p>{subnet.price?.toFixed(4) ?? "-"}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SubnetSelection;
