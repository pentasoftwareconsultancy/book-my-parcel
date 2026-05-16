import React from "react";
import {
  Dialog, DialogContent,
  Box, Typography, Stack, IconButton, Avatar, Divider, Button
} from "@mui/material";
import { X, Phone, MessageSquare, User, Star, Truck } from "lucide-react";

/**
 * ContactModal
 * @param {boolean}  open
 * @param {function} onClose
 * @param {object}   contact  - { name, phone, rating, vehicle, vehicleNumber, totalDeliveries, role }
 *                              role: "traveller" | "customer"
 */
const ContactModal = ({ open, onClose, contact }) => {
  if (!contact) return null;

  const isTraveller = contact.role === "traveller";
  const hasPhone = !!contact.phone;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      {/* Header */}
      <Box sx={{ bgcolor: isTraveller ? "#1D4ED8" : "#047857", px: 3, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight={700} fontSize={16} color="white">
            {isTraveller ? "Traveller Contact" : "Customer Contact"}
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: "white" }}>
            <X size={18} />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* Avatar + Name */}
        <Stack alignItems="center" spacing={1} mb={3}>
          <Avatar
            sx={{
              width: 64, height: 64,
              bgcolor: isTraveller ? "#1D4ED8" : "#047857",
              fontSize: 24
            }}
          >
            {contact.name?.[0]?.toUpperCase() || <User size={28} />}
          </Avatar>
          <Typography fontWeight={700} fontSize={18}>
            {contact.name || "Unknown"}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {isTraveller ? "Your Delivery Partner" : "Parcel Sender"}
          </Typography>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Details */}
        <Stack spacing={1.5}>
          {/* Phone */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2,
              bgcolor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Phone size={16} color="#1D4ED8" />
            </Box>
            <Box>
              <Typography fontSize={11} color="text.secondary">Phone</Typography>
              <Typography fontWeight={600} fontSize={14}>
                {contact.phone || "Not available"}
              </Typography>
            </Box>
          </Stack>

          {/* Rating — traveller only */}
          {isTraveller && contact.rating && contact.rating !== "N/A" && (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 2,
                bgcolor: "#FEF9C3", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Star size={16} color="#CA8A04" />
              </Box>
              <Box>
                <Typography fontSize={11} color="text.secondary">Rating</Typography>
                <Typography fontWeight={600} fontSize={14}>{contact.rating} / 5</Typography>
              </Box>
            </Stack>
          )}

          {/* Vehicle — traveller only */}
          {isTraveller && contact.vehicle && (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 2,
                bgcolor: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Truck size={16} color="#047857" />
              </Box>
              <Box>
                <Typography fontSize={11} color="text.secondary">Vehicle</Typography>
                <Typography fontWeight={600} fontSize={14}>
                  {contact.vehicle}
                  {contact.vehicleNumber && ` (${contact.vehicleNumber})`}
                </Typography>
              </Box>
            </Stack>
          )}

          {/* Total deliveries — traveller only */}
          {isTraveller && contact.totalDeliveries > 0 && (
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 2,
                bgcolor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <MessageSquare size={16} color="#1D4ED8" />
              </Box>
              <Box>
                <Typography fontSize={11} color="text.secondary">Deliveries Completed</Typography>
                <Typography fontWeight={600} fontSize={14}>{contact.totalDeliveries}</Typography>
              </Box>
            </Stack>
          )}
        </Stack>

        {/* Action buttons */}
        {hasPhone && (
          <Stack direction="row" spacing={1.5} mt={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Phone size={16} />}
              href={`tel:${contact.phone}`}
              sx={{ bgcolor: "#1D4ED8", "&:hover": { bgcolor: "#1E40AF" }, borderRadius: 2, fontWeight: 600 }}
            >
              Call
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MessageSquare size={16} />}
              href={`sms:${contact.phone}`}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              SMS
            </Button>
          </Stack>
        )}

        {!hasPhone && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "#FEF3C7", borderRadius: 2 }}>
            <Typography fontSize={12} color="#92400E" textAlign="center">
              Contact details will be available once the booking is confirmed.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
