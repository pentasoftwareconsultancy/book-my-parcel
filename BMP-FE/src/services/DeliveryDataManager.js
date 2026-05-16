// Common delivery data management
const STORAGE_KEY = "travelerDeliveries";
const INITIALIZED_KEY = "deliveriesInitialized";

// Initial mock data
const initialDeliveries = [
  {
    id: "BMP987654",
    customer: "Priya Sharma",
    status: "AVAILABLE",
    earnings: 225,
    parcelType: "Documents",
    weight: "0.5 kg",
    distance: "148 km",
    totalAmount: "₹450",
    pickup: "Mumbai, Bandra West",
    drop: "Pune, Koregaon Park",
    rating: 4.8,
    urgent: true,
  },
  {
    id: "BMP987655",
    customer: "Rahul Kumar", 
    status: "AVAILABLE",
    earnings: 180,
    parcelType: "Electronics",
    weight: "1 kg",
    distance: "85 km",
    totalAmount: "₹380",
    pickup: "Delhi, Connaught Place",
    drop: "Gurgaon, Cyber City",
    rating: 4.6,
  },
  {
    id: "BMP987656",
    customer: "Neha Singh",
    status: "AVAILABLE",
    earnings: 310,
    parcelType: "Clothing", 
    weight: "2 kg",
    distance: "120 km",
    totalAmount: "₹620",
    pickup: "Bangalore, Koramangala",
    drop: "Mysore, Jayalakshmipuram",
    rating: 4.9,
  },
  {
    id: "BMP987657",
    customer: "Amit Patel",
    status: "AVAILABLE",
    earnings: 150,
    parcelType: "Books",
    weight: "1.5 kg", 
    distance: "95 km",
    totalAmount: "₹300",
    pickup: "Chennai, T Nagar",
    drop: "Coimbatore, RS Puram",
    rating: 4.2,
  },
  {
    id: "BMP987658",
    customer: "Ravi Kumar",
    status: "AVAILABLE",
    earnings: 275,
    parcelType: "Gadgets", 
    weight: "1.2 kg",
    distance: "110 km",
    totalAmount: "₹550",
    pickup: "Hyderabad, Hitech City",
    drop: "Warangal, Kazipet",
    rating: 4.7,
  },
  {
    id: "BMP987659",
    customer: "Sneha Reddy",
    status: "AVAILABLE",
    earnings: 320,
    parcelType: "Medical Supplies",
    weight: "0.8 kg",
    distance: "75 km",
    totalAmount: "₹640",
    pickup: "Kolkata, Salt Lake",
    drop: "Howrah, Shibpur",
    rating: 4.5,
    urgent: true,
  },
  {
    id: "BMP987660",
    customer: "Vikash Gupta",
    status: "AVAILABLE",
    earnings: 195,
    parcelType: "Food Items",
    weight: "3 kg",
    distance: "45 km",
    totalAmount: "₹390",
    pickup: "Jaipur, Pink City",
    drop: "Ajmer, Pushkar Road",
    rating: 4.3,
  },
  {
    id: "BMP987661",
    customer: "Anita Sharma",
    status: "AVAILABLE",
    earnings: 280,
    parcelType: "Cosmetics",
    weight: "1.8 kg",
    distance: "130 km",
    totalAmount: "₹560",
    pickup: "Ahmedabad, Satellite",
    drop: "Vadodara, Alkapuri",
    rating: 4.6,
  },
  {
    id: "BMP987662",
    customer: "Deepak Yadav",
    status: "AVAILABLE",
    earnings: 350,
    parcelType: "Handicrafts",
    weight: "2.5 kg",
    distance: "200 km",
    totalAmount: "₹700",
    pickup: "Lucknow, Hazratganj",
    drop: "Kanpur, Civil Lines",
    rating: 4.4,
    urgent: true,
  },
  {
    id: "BMP987663",
    customer: "Pooja Mehta",
    status: "AVAILABLE",
    earnings: 165,
    parcelType: "Stationery",
    weight: "0.7 kg",
    distance: "60 km",
    totalAmount: "₹330",
    pickup: "Indore, Vijay Nagar",
    drop: "Bhopal, New Market",
    rating: 4.1,
  }
];

export const DeliveryDataManager = {
  // Initialize data only once
  initializeData: () => {
    const isInitialized = localStorage.getItem(INITIALIZED_KEY);
    if (!isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDeliveries));
      localStorage.setItem(INITIALIZED_KEY, "true");
    }
  },

  // Get all deliveries
  getAllDeliveries: () => {
    DeliveryDataManager.initializeData();
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialDeliveries;
  },

  // Get deliveries by status
  getDeliveriesByStatus: (status) => {
    const all = DeliveryDataManager.getAllDeliveries();
    return all.filter(d => d.status === status);
  },

  // Update delivery status
  updateDeliveryStatus: (id, newStatus) => {
    const all = DeliveryDataManager.getAllDeliveries();
    const updated = all.map(d => 
      d.id === id ? { ...d, status: newStatus } : d
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Add new delivery
  addDelivery: (delivery) => {
    const all = DeliveryDataManager.getAllDeliveries();
    const updated = [...all, { ...delivery, id: `BMP${Date.now()}` }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Reset to initial data (for testing)
  resetData: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(INITIALIZED_KEY);
  },

  // Force refresh data (reload initial deliveries)
  refreshData: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDeliveries));
    localStorage.setItem(INITIALIZED_KEY, "true");
    return initialDeliveries;
  },

  // Get stats
  getStats: () => {
    const all = DeliveryDataManager.getAllDeliveries();
    return {
      totalEarnings: all.reduce((sum, d) => sum + (d.earnings || 0), 0),
      available: all.filter(d => d.status === "AVAILABLE").length,
      active: all.filter(d => d.status === "ACTIVE").length,
      completed: all.filter(d => d.status === "DELIVERED").length,
      cancelled: all.filter(d => d.status === "CANCELLED").length,
      rating: "4.8"
    };
  }
};

export default DeliveryDataManager;