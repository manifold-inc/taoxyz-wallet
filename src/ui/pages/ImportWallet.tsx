import { useState } from "react";

const ImportWallet = () => {
  const [wordCount, setWordCount] = useState(12);
  const [mnemonic, setMnemonic] = useState("");

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      <h1 className="text-2xl font-bold">Import Account</h1>

      <div>
        <h2 className="text-lg mb-2">STEP 1:</h2>
        <h3 className="text-xl font-bold mb-4">Enter Mnemonic Seed</h3>
      </div>

      <div className="flex space-x-4">
        {[12, 15, 18, 21, 24].map((count) => (
          <button
            key={count}
            className={`px-3 py-1 rounded ${
              wordCount === count
                ? "bg-gray-700 text-white"
                : "bg-gray-800 text-gray-400"
            }`}
            onClick={() => setWordCount(count)}
          >
            {count} WORD
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 w-full max-w-2xl">
        {Array.from({ length: wordCount }, (_, i) => (
          <div key={i} className="border border-gray-700 rounded p-2">
            <div className="text-gray-500 mb-1">{i + 1}</div>
            <input className="w-full bg-transparent border-b border-gray-600 focus:outline-none" />
          </div>
        ))}
      </div>

      <div className="w-full max-w-2xl space-y-4">
        <div className="relative">
          <input
            type="text"
            className="w-full p-3 bg-transparent border border-gray-700 rounded"
            placeholder="ENTER MNEMONIC SEED"
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        </div>

        <div className="flex space-x-4">
          <button className="w-1/2 py-3 bg-gray-800 text-white rounded">
            Clear
          </button>
          <button className="w-1/2 py-3 bg-white text-black rounded">
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportWallet;
