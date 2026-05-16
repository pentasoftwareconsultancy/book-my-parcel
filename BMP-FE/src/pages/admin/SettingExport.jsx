import React, { useRef, useState } from "react";
import {
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiDatabase,
} from "react-icons/fi";

const SettingExport = () => {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      alert(`File selected: ${file.name}`);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 space-y-8">
      {/* Title */}
      <h2 className="text-lg font-semibold">Backup & Data Export</h2>

      {/* Automated Backup */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Automated Backups
        </h3>

        <div className="border border-purple-200 bg-purple-50 p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 flex items-center justify-center rounded-lg">
              <FiDatabase />
            </div>
            <div>
              <p className="text-sm font-medium">Daily Automatic Backups</p>
              <p className="text-xs text-gray-500">
                Last backup: Today at 2:00 AM
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md text-sm">
              <FiRefreshCw />
              Backup Now
            </button>

            <button className="flex items-center gap-2 border border-purple-500 text-purple-600 hover:bg-purple-100 px-5 py-2 rounded-md text-sm">
              <FiDownload />
              Download Latest
            </button>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Data Export
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "User Data", count: "15,847 users" },
            { title: "Partner Data", count: "3,421 partners" },
            { title: "Booking Data", count: "892 bookings" },
            { title: "Transaction Data", count: "1,245 transactions" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-blue-600">{item.count}</p>
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm">
                <FiDownload />
                Export CSV
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Import Data */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Import Data
        </h3>

        <div className="border border-blue-200 bg-blue-50 p-6 rounded-lg text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full">
              <FiUpload size={22} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Import Data from CSV</p>
            <p className="text-xs text-gray-500">
              Upload CSV files to import bulk data
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />

          <button
            onClick={handleFileSelect}
            className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm"
          >
            <FiUpload />
            Choose File
          </button>

          {/* Selected File Name */}
          {selectedFile && (
            <p className="text-xs text-gray-600 mt-2">
              Selected File: <b>{selectedFile.name}</b>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingExport;
