/**
 * Unauthorized Page
 * Displayed when user doesn't have required permissions
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        py={4}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            width: '100%',
          }}
        >
          <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />

          <Typography variant="h4" component="h1" gutterBottom>
            Access Denied
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            You don't have permission to access this page.
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            Please contact your administrator if you believe this is an error.
          </Typography>

          <Box mt={4} display="flex" gap={2} justifyContent="center">
            <Button variant="contained" onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;
export { UnauthorizedPage };
