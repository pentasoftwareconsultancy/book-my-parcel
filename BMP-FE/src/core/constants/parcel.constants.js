// src/core/constants/parcel.constants.js

export const SIZE_OPTIONS = [
  { id: "small",       title: "Small",       desc: "Documents, letters",  min: 0,  max: 1  },
  { id: "medium",      title: "Medium",      desc: "Books, clothes",      min: 1,  max: 5  },
  { id: "large",       title: "Large",       desc: "Electronics, shoes",  min: 5,  max: 10 },
  { id: "extra_large", title: "Extra Large", desc: "Furniture parts",     min: 10, max: 20 },
];

export const DELIVERY_OPTIONS = [
  { id: "standard", title: "Standard", desc: "More than 3 Days", badge: "POPULAR" },
  { id: "express",  title: "Express",  desc: "1–3 Days" },
  { id: "same_day", title: "Same Day", desc: "Today" },
];

export const PARCEL_TYPES = [
  { value: "documents",          label: "Documents" },
  { value: "electronics",        label: "Electronics" },
  { value: "clothing_apparel",   label: "Cloths" },
  { value: "food_groceries",     label: "Food Items" },
  { value: "medicine_healthcare",label: "Medicine & Healthcare" },
  { value: "other",              label: "Other" },
];