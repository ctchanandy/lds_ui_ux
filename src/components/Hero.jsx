import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function Hero() {
  return (
    <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Product mockup title
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        A short description that explains the product and entices the user to explore.
      </Typography>
      <Button variant="contained" size="large">
        Get started
      </Button>
    </Box>
  );
}
