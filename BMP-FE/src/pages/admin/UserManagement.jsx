// src/pages/UserManagement.jsx
import React, { useMemo, useEffect, useState } from "react";
import { FiUsers } from "react-icons/fi";
import { MdCheckCircle, MdPending, MdBlock, MdCancel } from "react-icons/md";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import withMaterialTable from "../../core/common/withMaterialTable";
import RoutePath from "../../core/constants/routes.constant";


/* ---------------- SUMMARY BLOCK ---------------- */
const UserSummary = ({ users, selectedStatus, onStatusClick }) => {
  const stats = useMemo(() => {
    const total = users.length;

    const statusCount = users.reduce(
      (acc, user) => {
        const status = user.kyc_verified ? 'active' : 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { active: 0, pending: 0, suspended: 0, banned: 0 }
    );

    return { total, ...statusCount };
  }, [users]);

  const Card = ({ title, value, color, icon, status }) => (
    <div
      onClick={() => onStatusClick(status)}
      className={`cursor-pointer rounded-md p-3 sm:p-4 border transition
        ${color}
        ${selectedStatus === status ? "ring-2 ring-blue-400 shadow-sm" : ""}
      `}
    >
      {icon}
      <p className="mt-2 text-xl sm:text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-[10px] sm:text-xs text-gray-500">{title}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 sm:gap-4 sm:mb-6 lg:grid-cols-5">
      <Card
        title="Total Users"
        value={stats.total}
        status="all"
        color="bg-white border-blue-200"
        icon={
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-white bg-blue-500 rounded-full">
            <FiUsers className="text-sm sm:text-base" />
          </div>
        }
      />

      <Card
        title="Active"
        value={stats.active}
        status="active"
        color="bg-white border-green-200"
        icon={
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-white bg-green-500 rounded-full">
            <MdCheckCircle className="text-sm sm:text-base" />
          </div>
        }
      />

      <Card
        title="Pending"
        value={stats.pending}
        status="pending"
        color="bg-white border-yellow-200"
        icon={
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-white bg-yellow-500 rounded-full">
            <MdPending className="text-sm sm:text-base" />
          </div>
        }
      />

      <Card
        title="Suspended"
        value={stats.suspended}
        status="suspended"
        color="bg-white border-orange-200"
        icon={
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-white bg-orange-500 rounded-full">
            <MdBlock className="text-sm sm:text-base" />
          </div>
        }
      />

      <Card
        title="Banned"
        value={stats.banned}
        status="banned"
        color="bg-white border-red-200"
        icon={
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 text-white bg-red-500 rounded-full">
            <MdCancel className="text-sm sm:text-base" />
          </div>
        }
      />
    </div>
  );
};

/* ---------------- TABLE CONFIG ---------------- */

const baseTableConfig = {
  title: "User Management",

  // ── Columns hidden on mobile (< 640px) — user + actions always visible ──
  mobileHiddenColumns: ["contact", "status", "kyc", "bookings", "total", "last_booking"],

  columns: [
    {
      accessorKey: "user",
      header: "USER",
      size: 170,
      Cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center text-sm font-semibold text-white bg-indigo-600 rounded-full w-9 h-9">
            {row.original.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <p className="text-sm font-semibold">{row.original.name}</p>
            <p className="text-xs text-gray-500">{row.original.city}, {row.original.state}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "contact",
      header: "CONTACT",
      size: 160,
      Cell: ({ row }) => (
        <div className="text-sm">
          <p className="font-medium">{row.original.email}</p>
          <p className="text-xs text-gray-500">{row.original.phone_number}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "STATUS",
      size: 90,
      Cell: ({ row }) => {
        const status = row.original.kyc_verified ? 'active' : 'pending';
        const map = {
          active: "bg-green-100 text-green-700",
          pending: "bg-yellow-100 text-yellow-700",
          suspended: "bg-orange-100 text-orange-700",
          banned: "bg-red-100 text-red-700",
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
      header: "KYC",
      size: 90,
      Cell: ({ row }) => {
        // Check if user has traveler KYC
        const kycStatus = row.original.kyc_verified ? 'verified' : 'not_verified';
        const map = {
          verified: "bg-green-100 text-green-700",
          not_verified: "bg-gray-100 text-gray-700",
          pending: "bg-yellow-100 text-yellow-700",
          submitted: "bg-blue-100 text-blue-700",
          rejected: "bg-red-100 text-red-700",
        };

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${map[kycStatus]}`}>
            {kycStatus.replace('_', ' ').charAt(0).toUpperCase() + kycStatus.replace('_', ' ').slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "bookings",
      header: "BOOKINGS",
      size: 80,
      Cell: ({ cell }) => (
        <div className="text-sm text-gray-700">{cell.getValue() || 0}</div>
      ),
    },
    {
      accessorKey: "total",
      header: "TOTAL SPEND",
      size: 100,
      Cell: ({ cell }) => (
        <span className="text-sm font-medium text-gray-800">
          ₹ {cell.getValue() ? cell.getValue().toLocaleString() : 0}
        </span>
      ),
    },

    {
      accessorKey: "last_booking",
      header: "LAST BOOKING",
      size: 110,
  Cell: ({ cell }) => {
    const value = cell.getValue();

    if (!value) {
      return <span className="text-xs text-gray-400">No bookings</span>;
    }

    return (
      <span className="text-xs text-gray-600">
        {new Date(value).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
    );
  },
},
  ],

 onView: (row, navigate) => {
  navigate(
    RoutePath.ADMIN_USERDETAILS.replace(":id", row.id),
    {
      state: { user: row }
    }
  );
},

  getData: async () => {
  try {
    const response = await ApiService.apiget(ServerUrl.API_ADMIN_USERS);

    if (response?.data?.success) {
      return response.data.users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        city: user.city,
        state: user.state,

        // status (temporary fallback if not from backend)
        is_active: user.is_active ?? true,
        is_suspended: user.is_suspended ?? false,

        // ✅ IMPORTANT: use backend values
        bookings: Number(user.bookings) || 0,
        total: Number(user.total_spend) || 0,
        last_booking: user.last_booking || null,
        kyc_verified: user.kyc_verified ?? false,

        rating: user.rating || null // if added later
      }));
    }

    return [];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
};

/* ---------------- PAGE ---------------- */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const userData = await baseTableConfig.getData();
        setUsers(userData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (selectedStatus === "all") return users;
    return users.filter((u) => {
      const status = u.kyc_verified ? 'active' : 'pending';
      return status === selectedStatus;
    });
  }, [users, selectedStatus]);

  const UserTable = useMemo(() => {
    return withMaterialTable(null, {
      ...baseTableConfig,
      getData: async () => filteredUsers,
    });
  }, [filteredUsers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
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
      <UserTable/>
    </div>
  );
};

export default UserManagement;

