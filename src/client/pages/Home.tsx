import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Taoxyz Wallet</h1>
      <p className="text-gray-600">Welcome to your secure crypto wallet</p>
      <div className="flex space-x-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate("/create")}
        >
          Create Wallet
        </button>
        <button
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={() => navigate("/import")}
        >
          Import Wallet
        </button>
      </div>
    </div>
  );
};

export default Home;
