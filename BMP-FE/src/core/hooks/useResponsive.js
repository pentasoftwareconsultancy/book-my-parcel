import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Custom hook for responsive design
 * Returns boolean values for different screen sizes
 */
const useResponsive = () => {
  const theme = useTheme();
  
  // Mobile devices (0px to 600px)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Tablet devices (600px to 960px)
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // Desktop devices (960px and above)
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  // Small mobile devices (0px to 480px)
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('xs'));
  
  // Large desktop devices (1280px and above)
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
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
    isTabletOrDesktop: isTablet || isDesktop
  };
};

export default useResponsive;