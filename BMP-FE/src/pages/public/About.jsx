import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Card,
  CardContent
} from '@mui/material';

const About = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 4 }}>
      <Container>
        <Box sx={{ py: 6 }}>
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
            About Book My Parcel
          </Typography>
          
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  height: '400px', 
                  bgcolor: '#e0e0e0', 
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h4">Our Story Image</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Our Story
              </Typography>
              <Typography variant="body1" paragraph>
                Book My Parcel was founded in 2020 with a simple mission: to make parcel delivery 
                more affordable, eco-friendly, and convenient. We recognized that traditional 
                courier services were often expensive and inefficient, especially for short-distance 
                deliveries.
              </Typography>
              <Typography variant="body1" paragraph>
                Our innovative platform connects people who need to send parcels with travelers 
                heading in the same direction. This not only reduces shipping costs but also 
                helps travelers earn extra income during their journeys.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ py: 6, bgcolor: '#f5f5f5', borderRadius: '20px', mb: 6 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
            Our Mission & Vision
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Our Mission
                  </Typography>
                  <Typography variant="body1">
                    To revolutionize the parcel delivery industry by creating a sustainable, 
                    community-driven platform that connects senders with travelers, reducing 
                    costs and environmental impact while providing a reliable service.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Our Vision
                  </Typography>
                  <Typography variant="body1">
                    To become the leading global platform for community-based parcel delivery, 
                    where every journey contributes to a more connected and sustainable world.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ py: 6 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
            Why Choose Book My Parcel?
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Affordable
                </Typography>
                <Typography variant="body1">
                  Save up to 40% compared to traditional courier services.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Eco-Friendly
                </Typography>
                <Typography variant="body1">
                  Reduce carbon footprint by utilizing existing travel routes.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Secure
                </Typography>
                <Typography variant="body1">
                  Real-time tracking and verified travelers for peace of mind.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default About;