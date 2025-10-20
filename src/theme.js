import { createTheme } from '@mui/material/styles';

const base = {
  palette: {
    primary: { main: '#1565c0' },
    header: { main: '#0f4c81', contrastText: '#ffffff' },
    neutral: { main: '#f5f7fb', contrastText: '#22303f' },
    assessed: { main: '#2e7d32', contrastText: '#ffffff' },
    unassessed: { main: '#d32f2f', contrastText: '#ffffff' }
  },
  components: {
    MuiButton: { defaultProps: { size: 'small' } },
    MuiChip: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: { root: { borderColor: '#e5e7eb' } }
    }
  }
};

export const lightTheme = createTheme({
  ...base,
  palette: { ...base.palette, mode: 'light' }
});

export const darkTheme = createTheme({
  ...base,
  palette: {
    ...base.palette,
    mode: 'dark',
    neutral: { main: '#202526', contrastText: '#e6eef8' },
    header: { main: '#07263f', contrastText: '#ffffff' }
  }
});

export default lightTheme;
