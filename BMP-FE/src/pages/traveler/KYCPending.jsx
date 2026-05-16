import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Alert
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import PendingActions from '@mui/icons-material/PendingActions';

const KYCPending = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        KYC Verification Pending
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Your KYC documents are under review. You'll be notified once approved.
      </Alert>
      
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <PendingActions sx={{ fontSize: 60, color: 'orange', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Verification in Progress
            </Typography>
            <Typography variant="body1" paragraph>
              Thank you for submitting your KYC documents. Our team is reviewing your information.
            </Typography>
            <Typography variant="body1" paragraph>
              This process typically takes 1-2 business days. You'll receive a notification once your account is verified.
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate(RoutePath.KYC_REGISTRATION)}
                sx={{ mr: 2 }}
              >
                Submit Additional Documents
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate(RoutePath.TRAVELER_DASHBOARD)}
              >
                Go to Dashboard
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          What happens after verification?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <VerifiedUser sx={{ fontSize: 40, color: 'green' }} />
            <Typography variant="body2">Access to Delivery Requests</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <AccountCircle sx={{ fontSize: 40, color: 'blue' }} />
            <Typography variant="body2">Full Profile Features</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default KYCPending;