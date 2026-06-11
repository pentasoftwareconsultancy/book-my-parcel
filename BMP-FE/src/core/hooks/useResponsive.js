import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Custom hook for responsive design.
 *
 * Breakpoints are now unified across all three systems:
 *   Tailwind CSS  → sm=640  md=768  lg=1024  xl=1280
 *   MUI theme     → sm=640  md=768  lg=1024  xl=1280  (updated in theme.js)
 *   JS listeners  → 640px  (MOBILE_BREAKPOINT in DashboardLayout + PublicHeader)
 *
 * This means isMobile here matches exactly what `sm:` does in Tailwind classes.
 */
const useResponsive = () => {
  const theme = useTheme();

  // Mobile: below Tailwind sm: (< 640px)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Tablet: between sm and lg (640px–1023px)
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  // Desktop: lg and above (≥ 1024px)
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Small mobile: xs only (< 640px — same as isMobile for now, kept for API compat)
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Large desktop: xl and above (≥ 1280px)
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('xl'));

  // Touch devices (typically mobile and tablet)
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSmallMobile,
    isLargeDesktop,
    isTouchDevice,
    isMobileOrTablet: isMobile || isTablet,
    isTabletOrDesktop: isTablet || isDesktop,
  };
};

export default useResponsive;