const Signin = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Sign In</h2>
      <div className="w-full max-w-md p-4 border rounded-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Enter your password"
            />
          </div>
          <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signin;
