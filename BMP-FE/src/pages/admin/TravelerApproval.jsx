// src/pages/TravelerApproval.jsx
import React, { useMemo, useEffect, useState } from "react";
import { FiUsers } from "react-icons/fi";
import { MdCheckCircle, MdPending, MdBlock, MdCancel } from "react-icons/md";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import RoutePath from "../../core/constants/routes.constant";
import { showToast } from "../../core/utils/toast.util";
import withMaterialTable from "../../core/common/withMaterialTable";

/* ---------------- SUMMARY BLOCK ---------------- */
const UserSummary = ({ users, selectedStatus, onStatusClick }) => {
  const stats = useMemo(() => {
    const total = users.length;

    const statusCount = users.reduce(
      (acc, user) => {
        const status = user.kyc_status?.toLowerCase() || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { approved: 0, pending: 0, rejected: 0, suspended: 0 }
    );

    return { total, ...statusCount };
  }, [users]);

  const Card = ({ title, value, icon, status }) => (
    <div
      onClick={() => onStatusClick(status)}
      className={`cursor-pointer rounded-lg border bg-white p-3 sm:p-4 shadow-sm transition
        ${selectedStatus === status ? "ring-2 ring-blue-500" : ""}
      `}
    >
      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-blue-600 rounded-md bg-blue-50">
        {icon}
      </div>
      <p className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold">{value}</p>
      <p className="text-[10px] sm:text-xs text-gray-500">{title}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 sm:gap-4 sm:mb-6 lg:grid-cols-5">
  <Card
    title="Total Partners"
    value={stats.total}
    status="all"
    icon={
      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-white bg-blue-500 rounded-full">
        <FiUsers className="text-sm sm:text-base" />
      </div>
    }
  />

  <Card
    title="Verified"
    value={stats.approved || 0}
    status="approved"
    icon={
      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-white bg-green-500 rounded-full">
        <MdCheckCircle className="text-sm sm:text-base" />
      </div>
    }
  />

  <Card
    title="Pending KYC"
    value={stats.pending || 0}
    status="pending"
    icon={
      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-white bg-yellow-500 rounded-full">
        <MdPending className="text-sm sm:text-base" />
      </div>
    }
  />

  <Card
    title="Rejected"
    value={stats.rejected || 0}
    status="rejected"
    icon={
      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-white bg-red-500 rounded-full">
        <MdCancel className="text-sm sm:text-base" />
      </div>
    }
  />

  <Card
    title="Suspended"
    value={stats.suspended || 0}
    status="suspended"
    icon={
      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-white bg-orange-500 rounded-full">
        <MdBlock className="text-sm sm:text-base" />
      </div>
    }
  />
</div>

  );
};

/* ---------------- TABLE CONFIG ---------------- */
const userTableConfig = {
  title: "Partners",

  // ── Columns hidden on mobile (< 640px) — partner + actions always visible ──
  mobileHiddenColumns: ["contact", "kyc"],

  columns: [
    {
      accessorKey: "partner",
      header: "PARTNER",
      Cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center text-sm font-semibold text-white rounded-full w-9 h-9 bg-gradient-to-br from-pink-500 to-purple-500">
            {row.original.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <p className="text-sm font-semibold">{row.original.name}</p>
            <p className="text-xs text-blue-500">{row.original.city}, {row.original.state}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "contact",
      header: "CONTACT",
      Cell: ({ row }) => (
        <div className="text-sm">
          <p className="text-gray-700">{row.original.email}</p>
          <p className="text-xs text-gray-500">{row.original.phone_number}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      Cell: ({ row }) => {
        const status = row.original.kyc_status?.toLowerCase() || 'pending';
        const map = {
          approved: "bg-green-100 text-green-700",
          pending: "bg-yellow-100 text-yellow-700",
          rejected: "bg-red-100 text-red-700",
          suspended: "bg-orange-100 text-orange-700",
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "kyc",
      header: "VERIFICATION",
      Cell: ({ row }) => {
        const status = row.original.kyc_status?.toLowerCase() || 'pending';
        const map = {
          approved: "text-green-600",
          pending: "text-yellow-600",
          rejected: "text-red-600",
          suspended: "text-orange-600",
        };
        
        return (
          <div className={`text-xs font-medium ${map[status]}`}>
            ● KYC {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        );
      },
    },
  ],

  onView: (row, navigate) => {
    navigate(
      RoutePath.ADMIN_TRAVELERDETAILS.replace(":id", row.id),
      {
        state: { traveler: row }
      }
    );
  },

  getData: async () => {
    try {
      const response = await ApiService.apiget(ServerUrl.API_ADMIN_TRAVELER_KYC);
      if (response?.data?.success) {
        return response.data.travelers.map(traveler => ({
          id: traveler.user_id,
          kyc_id: traveler.kyc_id,
          name: traveler.name,
          email: traveler.email,
          phone_number: traveler.phone_number,
          city: traveler.city,
          state: traveler.state,
          kyc_status: traveler.kyc_status,
          user_created_at: traveler.user_created_at,
          kyc_created_at: traveler.kyc_created_at,
          kyc_updated_at: traveler.kyc_updated_at
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching travelers:', error);
      return [];
    }
  },
};

const handleApproveKYC = async (kycId, setUsers) => {
  try {
    await ApiService.apipatch(`${ServerUrl.API_ADMIN_TRAVELER_KYC}/${kycId}`, { status: 'APPROVED' });
    showToast.success('KYC approved successfully!');
    setUsers(prev => prev.map(u => u.kyc_id === kycId ? { ...u, kyc_status: 'APPROVED' } : u));
  } catch (error) {
    showToast.error('Failed to approve KYC');
  }
};

const handleRejectKYC = async (kycId, setUsers) => {
  try {
    await ApiService.apipatch(`${ServerUrl.API_ADMIN_TRAVELER_KYC}/${kycId}`, { status: 'REJECTED' });
    showToast.error('KYC rejected.');
    setUsers(prev => prev.map(u => u.kyc_id === kycId ? { ...u, kyc_status: 'REJECTED' } : u));
  } catch (error) {
    showToast.error('Failed to reject KYC');
  }
};

/* ---------------- PAGE ---------------- */
const TravelerApproval = () => {
  const [users, setUsers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTravelers = async () => {
      setLoading(true);
      try {
        const userData = await userTableConfig.getData();
        setUsers(userData);
      } catch (error) {
        console.error('Error loading travelers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTravelers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (selectedStatus === "all") return users;
    return users.filter((u) => {
      const status = u.kyc_status?.toLowerCase() || 'pending';
      return status === selectedStatus;
    });
  }, [users, selectedStatus]);

  const UserTable = useMemo(() => {
    return withMaterialTable(null, {
      ...userTableConfig,
      getData: async () => filteredUsers,
      onView: (row, navigate) => {
        navigate(RoutePath.ADMIN_TRAVELERDETAILS.replace(":id", row.id), { state: { traveler: row } });
      },
    });
  }, [filteredUsers, setUsers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading travelers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <UserSummary
        users={users}
        selectedStatus={selectedStatus}
        onStatusClick={setSelectedStatus}
      />
      <UserTable />
    </div>
  );
};

export default TravelerApproval;