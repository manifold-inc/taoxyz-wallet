import type { Subnet } from "../../../types/types";

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
    <div>
      <h2 className="text-xl font-semibold mb-4">Select a Subnet</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subnets.map((subnet) => (
          <div
            key={subnet.id}
            className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
            onClick={() => onSelect(subnet)}
          >
            <h3 className="text-lg font-medium mb-2">{subnet.name}</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Price</span>
              <span className="font-medium">{subnet.price} TAO</span>
            </div>
            <div className="mt-4">
              <button
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(subnet);
                }}
              >
                Select Subnet
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubnetSelection;
