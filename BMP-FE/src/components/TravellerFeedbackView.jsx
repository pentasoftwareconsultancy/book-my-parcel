import { useState, useEffect } from "react";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Paper, 
  Alert,
  Chip,
  Rating,
  Divider,
  Loading,
  CircularProgress
} from "@mui/material";
import { useParams } from "react-router-dom";
import { Star, MessageCircle } from "react-icons/fa";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import { showToast } from "../../core/utils/toast.util";

const TravellerFeedbackView = ({ bookingId }) => {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, [bookingId]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      // GET /api/feedback/booking/:bookingId
      // This returns the feedback user gave for this delivery
      const response = await ApiService.apiget(
        `${ServerUrl.API_FEEDBACK_BASE}/booking/${bookingId}`
      );
      
      if (response.data) {
        setFeedback(response.data);
      } else {
        setFeedback(null);
      }
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
      setError(err?.response?.data?.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!feedback) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No feedback yet for this delivery. Once the customer rates, you'll see it here.
      </Alert>
    );
  }

  return (
    <Card sx={{ mb: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
      <CardContent>
        {/* Rating Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box sx={{ mr: 2 }}>
            <Rating 
              value={feedback.rating} 
              readOnly 
              size="large"
              sx={{ color: "#ffc107" }}
            />
          </Box>
          <Typography variant="h6">
            {["Poor", "Fair", "Good", "Very Good", "Excellent"][feedback.rating - 1]} Rating
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Tags */}
        {feedback.tags && feedback.tags.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              Highlights:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {feedback.tags.map((tag, idx) => (
                <Chip 
                  key={idx} 
                  label={tag} 
                  size="small"
                  sx={{ 
                    backgroundColor: "#e3f2fd",
                    color: "#1976d2"
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Comment */}
        {feedback.comment && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              <MessageCircle style={{ marginRight: 8, verticalAlign: "middle" }} />
              Review:
            </Typography>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                backgroundColor: "#f5f5f5",
                borderLeft: "4px solid #1976d2"
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {feedback.comment}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Date */}
        <Typography variant="caption" color="textSecondary">
          Feedback on: {new Date(feedback.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TravellerFeedbackView;
