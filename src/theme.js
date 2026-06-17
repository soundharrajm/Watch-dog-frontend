import { createTheme } from '@mui/material/styles'

export default createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: '#7c3aed' },
    secondary: { main: '#34d399' },
    error:     { main: '#ef4444' },
    warning:   { main: '#f97316' },
    info:      { main: '#60a5fa' },
    success:   { main: '#22c55e' },
    background: {
      default: '#0a0a14',
      paper:   '#12121f',
    },
    text: {
      primary:   '#e8e8f0',
      secondary: '#94a3b8',
      disabled:  '#475569',
    },
  },
  typography: {
    fontFamily: "'Inter','Segoe UI',sans-serif",
    h6: { fontWeight: 700, letterSpacing: '-0.3px' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
  },
})
