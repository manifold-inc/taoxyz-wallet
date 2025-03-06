import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KeyringService } from "../services/KeyringService";
import { useRpcApi } from "../contexts/RpcApiContext";
import { Trash2 } from "lucide-react";

interface WebsiteAccess {
  [website: string]: {
    hasAccess: boolean;
    accountCount: number;
  };
}

const Settings = () => {
  const navigate = useNavigate();
  const { setEndpoint } = useRpcApi();
  const [selectedNetwork, setSelectedNetwork] = useState<"test" | "main">(
    "test"
  );
  const [websiteAccess, setWebsiteAccess] = useState<WebsiteAccess>({});
  const [newWebsite, setNewWebsite] = useState("");

  useEffect(() => {
    const loadWebsiteAccess = async () => {
      const result = await chrome.storage.local.get("websitePermissions");
      const permissions = result.websitePermissions || {};

      const access: WebsiteAccess = {};
      Object.entries(permissions).forEach(([website, accounts]) => {
        const accountCount = Object.values(
          accounts as { [key: string]: boolean }
        ).filter((hasAccess) => hasAccess).length;
        access[website] = {
          hasAccess: accountCount > 0,
          accountCount,
        };
      });
      setWebsiteAccess(access);
    };

    loadWebsiteAccess();
  }, []);

  const handleNetworkChange = (network: "test" | "main") => {
    if (
      window.confirm(
        "Changing the network will require a restart and log you out. Do you want to continue?"
      )
    ) {
      setSelectedNetwork(network);

      setEndpoint(network);
      navigate("/");
    }
  };

  const handleWebsiteAccessToggle = async (
    website: string,
    allowed: boolean
  ) => {
    const updatedAccess = {
      ...websiteAccess,
      [website]: {
        ...websiteAccess[website],
        hasAccess: allowed,
        accountCount: allowed ? 1 : 0,
      },
    };
    setWebsiteAccess(updatedAccess);

    const result = await chrome.storage.local.get("websitePermissions");
    const permissions = result.websitePermissions || {};
    const accounts = await KeyringService.getAccounts();

    permissions[website] = accounts.reduce(
      (acc: { [key: string]: boolean }, account) => {
        acc[account.address] = allowed;
        return acc;
      },
      {}
    );

    await chrome.storage.local.set({ websitePermissions: permissions });
  };

  const handleRemoveWebsite = async (website: string) => {
    if (window.confirm(`Remove access for ${website}?`)) {
      const updatedAccess = { ...websiteAccess };
      delete updatedAccess[website];
      setWebsiteAccess(updatedAccess);

      const result = await chrome.storage.local.get("websitePermissions");
      const permissions = result.websitePermissions || {};
      delete permissions[website];
      await chrome.storage.local.set({ websitePermissions: permissions });
    }
  };

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebsite) return;

    setWebsiteAccess((prev) => ({
      ...prev,
      [newWebsite]: {
        hasAccess: true,
        accountCount: 0,
      },
    }));
    setNewWebsite("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Network Selection */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Network</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handleNetworkChange("test")}
              className={`px-4 py-2 rounded ${
                selectedNetwork === "test"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Testnet
            </button>
            <button
              onClick={() => handleNetworkChange("main")}
              className={`px-4 py-2 rounded ${
                selectedNetwork === "main"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Mainnet
            </button>
          </div>
        </div>

        {/* Website Access Management */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Manage Website Access</h2>

          {/* Add new website */}
          <form onSubmit={handleAddWebsite} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                placeholder="example.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </form>

          {/* Website list */}
          <div className="space-y-4">
            {Object.entries(websiteAccess).map(
              ([website, { hasAccess, accountCount }]) => (
                <div
                  key={website}
                  className="flex items-center justify-between py-2 border-b"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">{website}</span>
                    {accountCount > 0 && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        {accountCount} accounts
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAccess}
                        onChange={(e) =>
                          handleWebsiteAccessToggle(website, e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <button
                      onClick={() => handleRemoveWebsite(website)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to log out?")) {
                navigate("/");
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
