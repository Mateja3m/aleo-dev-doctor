import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1756D1'
    },
    secondary: {
      main: '#0A7C66'
    },
    background: {
      default: '#F5F7FB'
    }
  },
  shape: {
    borderRadius: 12
  }
});
