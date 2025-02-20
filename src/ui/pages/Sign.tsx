const Sign = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Sign Transaction</h2>
      <div className="w-full max-w-md p-4 border rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">To Address</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="0.0"
            />
          </div>
          <button className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Sign Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sign; 