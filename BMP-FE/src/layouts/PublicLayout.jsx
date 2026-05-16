
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from '../components/PublicHeader';
import { UserFooter, TravelerFooter } from '../components/PublicFooter';
import useResponsive from '../core/hooks/useResponsive';
import FloatingChat from '../core/common/FloatingChat';
import { APPLICATION_CONSTANTS } from '../core/constants/app.constant';

import { useSelector } from "react-redux";
import StorageService from "../core/services/storage.service";

const PublicLayout = () => {
  const { isAuthenticated, user: reduxUser } = useSelector((state) => state.auth);
  // Use Redux state first (always up-to-date), fall back to StorageService which
  // checks both sessionStorage and localStorage — fixes the non-rememberMe token bug
  // where a direct localStorage.getItem() would miss sessionStorage tokens.
  const user = reduxUser ?? StorageService.getData(APPLICATION_CONSTANTS.STORAGE.USER_DETAILS);
  const { isMobile } = useResponsive();

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      <Navbar />

      <Box
        component="main"
        sx={{
          flex: 1,
          mt: isAuthenticated ? '64px' : 0,   // 👈 THIS IS THE FIX
          width: '100%',
          maxWidth: '100vw'
        }}
      >
        <Outlet />
        <FloatingChat />
      </Box>

      {user?.activeRole === "TRAVELLER" ? <TravelerFooter /> : <UserFooter />}      </Box>
  );
};

export default PublicLayout;