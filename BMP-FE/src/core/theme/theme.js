import { createTheme } from '@mui/material/styles';

// ─── Shared breakpoints — kept in sync with Tailwind config ──────────────────
// Tailwind defaults: sm=640, md=768, lg=1024, xl=1280, 2xl=1536
// MUI defaults were: sm=600, md=960, lg=1280, xl=1920 (different!)
// We align MUI to Tailwind so useResponsive() hook matches CSS breakpoints.
const theme = createTheme({
  breakpoints: {
    values: {
      xs:  0,
      sm:  640,   // matches Tailwind sm:
      md:  768,   // matches Tailwind md:
      lg:  1024,  // matches Tailwind lg:
      xl:  1280,  // matches Tailwind xl:
      xxl: 1536,  // matches Tailwind 2xl:
    },
  },
  typography: {
    // Matches the project's Tailwind font — was "Roboto" (mismatch)
    fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

export default theme;