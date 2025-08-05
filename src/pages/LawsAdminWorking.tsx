import { useState } from "react";

const LawsAdminWorking = () => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    // TODO: Implement sync functionality
    setTimeout(() => {
      setSyncing(false);
      alert("Sync functionality not yet implemented");
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Laws Administration</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          This page will allow you to sync NY State Laws from the Senate API.
        </p>
        
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
        >
          {syncing ? "Syncing..." : "Sync All Laws"}
        </button>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Status</h2>
        <p className="text-gray-600">
          Ready to sync laws from NY Senate API
        </p>
      </div>
    </div>
  );
};

export default LawsAdminWorking;