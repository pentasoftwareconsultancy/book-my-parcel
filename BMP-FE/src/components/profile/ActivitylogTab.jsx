import React, { useState } from "react";

const DUMMY_LOGS = [
  { id: 1, action: "Logged in from Mumbai, Maharashtra", date: "2024-12-28 10:30 AM", ip: "192.168.1.1", device: "Chrome on Windows" },
  { id: 2, action: "Updated platform settings",          date: "2024-12-27 04:15 PM", ip: "192.168.1.1", device: "Chrome on Windows" },
  { id: 3, action: "Verified partner #000003",           date: "2024-12-27 02:20 PM", ip: "192.168.1.1", device: "Chrome on Windows" },
  { id: 4, action: "Logged in from Mumbai, Maharashtra", date: "2024-12-27 09:00 AM", ip: "192.168.1.2", device: "Safari on iPhone" },
  { id: 5, action: "Resolved dispute DSP002",            date: "2024-12-26 11:30 AM", ip: "192.168.1.1", device: "Chrome on Windows" },
];

const ActivityLogTab = () => {
  const [logs, setLogs] = useState(DUMMY_LOGS);

  const handleClearAll = () => setLogs([]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
        {logs.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-red-300 hover:text-red-500 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Log Items */}
      {logs.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No activity to show.</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-4 py-3.5 shadow-sm"
            >
              {/* Icon */}
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{log.action}</p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{log.date}</span>
                  <span className="text-gray-300 text-xs">•</span>
                  <span className="text-xs text-gray-400">IP: {log.ip}</span>
                  <span className="text-gray-300 text-xs">•</span>
                  <span className="text-xs text-gray-400">{log.device}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLogTab;