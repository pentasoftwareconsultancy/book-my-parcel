import React from 'react';
import DashboardLayout from './DashboardLayout';
import useResponsive from '../core/hooks/useResponsive';

const UserLayout = () => {
  const { isMobile } = useResponsive();
  
  return (
    <DashboardLayout role="USER" />
  );
};

export default UserLayout;