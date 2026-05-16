import React from 'react';
import { useNavigate } from 'react-router-dom';
import RoutePath from '../../core/constants/routes.constant';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Card,
  CardContent
} from '@mui/material';
import LocalShipping from '@mui/icons-material/LocalShipping';
import Person from '@mui/icons-material/Person';
import EmojiTransportation from '@mui/icons-material/EmojiTransportation';
import Security from '@mui/icons-material/Security';
import Speed from '@mui/icons-material/Speed';
import Public from '@mui/icons-material/Public';

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: <LocalShipping sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Parcel Delivery',
      description: 'Send your parcels securely with our reliable delivery service. Track your package in real-time from pickup to delivery.',
      features: ['Real-time tracking', 'Insurance coverage', 'Signature confirmation']
    },
    {
      icon: <Person sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Traveler Network',
      description: 'Connect with verified travelers who are heading in your parcel\'s direction. Earn money by delivering during your travels.',
      features: ['Verified travelers', 'Flexible scheduling', 'Earnings tracking']
    },
    {
      icon: <EmojiTransportation sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Multi-modal Transport',
      description: 'We support various transport modes including road, rail, and air to ensure your parcel reaches its destination efficiently.',
      features: ['Road transport', 'Rail transport', 'Air freight options']
    }
  ];

  const benefits = [
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Insured',
      description: 'All parcels are insured and tracked throughout the delivery process.'
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Fast Delivery',
      description: 'Quick and efficient delivery using existing travel routes.'
    },
    {
      icon: <Public sx={{ fontSize: 40 }} />,
      title: 'Eco-friendly',
      description: 'Reduce carbon footprint by utilizing existing travel routes.'
    }
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Container>
        {/* Services Hero */}
        <Box sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8, 
          mb: 6,
          textAlign: 'center',
          borderRadius: '20px'
        }}>
          <Container>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Our Services
            </Typography>
            <Typography variant="h5" sx={{ maxWidth: 800, mx: 'auto' }}>
              Comprehensive parcel delivery solutions tailored to your needs
            </Typography>
          </Container>
        </Box>

        <Box sx={{ mb: 8 }}>
          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    {service.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {service.title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {service.description}
                  </Typography>
                  <Box sx={{ textAlign: 'left' }}>
                    {service.features.map((feature, idx) => (
                      <Typography variant="body2" key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <span style={{ marginRight: 8 }}>•</span> {feature}
                      </Typography>
                    ))}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Benefits */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 6 }}>
            Why Choose Our Services?
          </Typography>
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {benefit.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body1">
                    {benefit.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        {/* How It Works */}
        <Box sx={{ py: 6, bgcolor: '#f5f5f5', borderRadius: '20px', mb: 6 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
            How It Works
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  1
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Book Your Parcel
                </Typography>
                <Typography variant="body2">
                  Enter pickup and delivery details
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  2
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Match with Traveler
                </Typography>
                <Typography variant="body2">
                  Get matched with verified travelers
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  3
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Track Delivery
                </Typography>
                <Typography variant="body2">
                  Real-time tracking of your parcel
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  4
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Receive Parcel
                </Typography>
                <Typography variant="body2">
                  Secure delivery with confirmation
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Send Your Parcel?
          </Typography>
          <Typography variant="h6" paragraph>
            Join thousands of satisfied customers using our service
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            sx={{ mt: 2, py: 1.5, px: 4 }}
            onClick={() => navigate(RoutePath.AUTH_LOGIN)}
          >
            Get Started Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
};
export default Services;