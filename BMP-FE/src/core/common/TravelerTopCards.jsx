// import React from "react";
// import { Card, Box, Typography, Avatar, Grid } from "@mui/material";
// import { Wallet, Truck, Clock, Star } from "lucide-react";

// const TravelerTopCards = ({ stats }) => {
//   const statsCards = [
//     {
//       title: "Total Earnings",
//       value: `₹${stats.totalEarnings}`,
//       icon: Wallet,
//       gradient: "from-green-400 to-green-500",  
//       bgColor: "#00C853",
//     },
//     {
//       title: "Active Deliveries",
//       value: stats.activeDeliveries,
//       icon: Truck,
//       gradient: "from-orange-400 to-orange-500",
//       bgColor: "#FF6D00",
//     },
//     {
//       title: "Completed Deliveries",
//       value: stats.completedDeliveries,
//       icon: Clock,
//       gradient: "from-blue-400 to-blue-500",
//       bgColor: "#0EA5E9",
//     },
//     {
//       title: "Average Rating",
//       value: stats.rating,
//       icon: Star,
//       gradient: "from-purple-400 to-purple-500",
//       bgColor: "#D946EF",
//     },
//   ];

//   return (
//     <Grid container spacing={2} mb={3}>
//       {statsCards.map((card, index) => {
//         const Icon = card.icon;
//         return (
//           <Grid item xs={12} sm={6} md={3} key={index}>
//             <Card sx={{ bgcolor: card.bgColor, color: "#fff", borderRadius: 3 }}>
//               <Box
//                 p={2}
//                 display="flex"
//                 justifyContent="space-between"
//                 alignItems="center"
//               >
//                 <Box>
//                   <Typography fontSize={13}>{card.title}</Typography>
//                   <Typography fontSize={22} fontWeight={700}>
//                     {card.value}
//                   </Typography>
//                 </Box>
//                 <Avatar sx={{ bgcolor: "rgba(255,255,255,0.25)" }}>
//                   <Icon size={22} />
//                 </Avatar>
//               </Box>
//             </Card>
//           </Grid>
//         );
//       })}
//     </Grid>
//   );
// };

// export default TravelerTopCards;
