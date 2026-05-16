// components/kyc/KycStatusBadge.jsx

const KycStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'verified':
      case 'success':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Verified'
        };
      case 'pending':
      case 'in_progress':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'Pending'
        };
      case 'rejected':
      case 'failed':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          label: 'Rejected'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default KycStatusBadge;