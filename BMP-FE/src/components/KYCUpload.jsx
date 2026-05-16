import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';

const KYCUpload = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { loading, error } = useSelector(state => state.admin);
  
  const [docType, setDocType] = useState('');
  const [docUrl, setDocUrl] = useState('');
  
  const handleUpload = () => {
    // In a real application, this would dispatch an action to upload KYC
    console.log('Uploading KYC:', { docType, docUrl, userId: user.id });
    alert('KYC uploaded successfully!');
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload KYC Document
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mt: 2 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Document Type</InputLabel>
          <Select
            value={docType}
            label="Document Type"
            onChange={(e) => setDocType(e.target.value)}
          >
            <MenuItem value="AADHAAR">Aadhaar Card</MenuItem>
            <MenuItem value="PAN">PAN Card</MenuItem>
            <MenuItem value="PASSPORT">Passport</MenuItem>
            <MenuItem value="DRIVING_LICENSE">Driving License</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="Document URL"
          value={docUrl}
          onChange={(e) => setDocUrl(e.target.value)}
          margin="normal"
          helperText="In a real application, this would be a file upload"
        />
        
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={loading || !docType || !docUrl}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload KYC'}
        </Button>
      </Paper>
    </Box>
  );
};

export default KYCUpload;
