import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Rating,
  Chip,
  Divider,
  Button
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import Star from "@mui/icons-material/Star";
import TrendingUp from "@mui/icons-material/TrendingUp";
import ApiService from "../../core/services/api.service";
import ServerUrl from "../../core/constants/serverUrl.constant";
import { showToast } from "../../core/utils/toast.util";

const TravellerReviews = () => {
  const { user } = useSelector(state => state.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [travellerProfileId, setTravellerProfileId] = useState(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  // First, fetch the traveller profile to get the traveller profile ID
  useEffect(() => {
    const fetchTravellerProfile = async () => {
      try {
        const response = await ApiService.apiget(ServerUrl.API_PROFILE);
        if (response.data?.user?.travellerProfile?.id) {
          setTravellerProfileId(response.data.user.travellerProfile.id);
        }
      } catch (err) {
        console.error("Failed to fetch traveller profile:", err);
        setError("Failed to load traveller profile");
      }
    };

    if (user?.id) {
      fetchTravellerProfile();
    }
  }, [user?.id]);

  // Then, fetch reviews once we have the traveller profile ID
  useEffect(() => {
    if (travellerProfileId) {
      fetchReviews();
    }
  }, [travellerProfileId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await ApiService.apiget(
        `${ServerUrl.API_FEEDBACK_BASE}/traveller/${travellerProfileId}`
      );

      // responseSuccess wraps data as { success: true, data: [...] }
      const feedbacks = response.data?.data || response.data || [];
      const feedbackArray = Array.isArray(feedbacks) ? feedbacks : [];

      setReviews(feedbackArray);
      calculateStats(feedbackArray);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError(err?.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (feedbacks) => {
    const totalReviews = feedbacks.length;
    let sumRating = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    feedbacks.forEach(fb => {
      sumRating += fb.rating;
      distribution[fb.rating]++;
    });

    const averageRating = totalReviews > 0 ? (sumRating / totalReviews).toFixed(1) : 0;

    setStats({
      totalReviews,
      averageRating: parseFloat(averageRating),
      ratingDistribution: distribution
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#1976d2" }}>
        <Star sx={{ mr: 1, verticalAlign: "middle" }} />
        My Feedback & Reviews
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: "center", backgroundColor: "#f5f5f5" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Rating
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", my: 1 }}>
                <Typography variant="h3" sx={{ mr: 1, color: "#ffc107" }}>
                  {stats.averageRating}
                </Typography>
                <Rating value={Math.round(stats.averageRating)} readOnly />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: "center", backgroundColor: "#f5f5f5" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Reviews
              </Typography>
              <Typography variant="h3" sx={{ color: "#1976d2" }}>
                {stats.totalReviews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: "#f5f5f5" }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom sx={{ mb: 2 }}>
                Rating Distribution
              </Typography>
              <Box>
                {[5, 4, 3, 2, 1].map(star => (
                  <Box key={star} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Box sx={{ width: 40, display: "flex", alignItems: "center" }}>
                      {[...Array(star)].map((_, i) => (
                        <Star key={i} sx={{ fontSize: 16, color: "#ffc107" }} />
                      ))}
                    </Box>
                    <Box sx={{ 
                      flex: 1, 
                      height: 8, 
                      backgroundColor: "#e0e0e0",
                      borderRadius: 1,
                      mx: 1,
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      <Box sx={{
                        height: "100%",
                        width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[star] / stats.totalReviews * 100) : 0}%`,
                        backgroundColor: "#ffc107",
                        transition: "width 0.3s ease"
                      }} />
                    </Box>
                    <Typography variant="caption" sx={{ width: 30 }}>
                      {stats.ratingDistribution[star]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* Reviews List */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Customer Reviews
      </Typography>

      {reviews.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No reviews yet. Start completing deliveries to receive feedback from customers!
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {reviews.map((review) => (
            <Paper key={review.id} sx={{ p: 3, borderLeft: "4px solid #ffc107" }}>
              {/* Header with Rating */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                <Box>
                  <Rating value={review.rating} readOnly size="small" sx={{ color: "#ffc107" }} />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    {new Date(review.createdAt).toLocaleDateString()} at {new Date(review.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
                <Typography 
                  variant="subtitle2" 
                  sx={{
                    px: 2,
                    py: 0.5,
                    backgroundColor: "#e3f2fd",
                    borderRadius: 1,
                    color: "#1976d2"
                  }}
                >
                  Parcel #{review.parcel_id?.slice(0, 8)}
                </Typography>
              </Box>

              {/* Tags */}
              {review.tags && review.tags.length > 0 && (
                <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {review.tags.map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      size="small"
                      sx={{
                        backgroundColor: "#e8f5e9",
                        color: "#2e7d32"
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* Comment */}
              {review.comment && (
                <Paper elevation={0} sx={{ 
                  p: 2, 
                  backgroundColor: "#f9f9f9",
                  borderLeft: "3px solid #1976d2",
                  mb: 2
                }}>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {review.comment}
                  </Typography>
                </Paper>
              )}

              {/* From User */}
              {review.reviewer && (
                <Typography variant="caption" color="textSecondary">
                  From: <strong>{review.reviewer.name || "Unnamed Customer"}</strong>
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TravellerReviews;
