export interface CustomizationOption {
  id: string;
  label: string;
  choices: { value: string; label: string; extra?: number }[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  customizations?: CustomizationOption[];
}

export interface ItemCustomization {
  [optionId: string]: string;
}

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  quantity: number;
  selectedCustomizations?: ItemCustomization;
  specialInstructions?: string;
  cartKey: string;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: "cod" | "gcash" | "card";
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customer: CustomerInfo;
  status: "confirmed" | "preparing" | "on-the-way" | "delivered";
  createdAt: Date;
}

// Shared customization presets
const spiceLevel: CustomizationOption = {
  id: "spice",
  label: "Spice Level",
  choices: [
    { value: "mild", label: "Mild" },
    { value: "medium", label: "Medium" },
    { value: "hot", label: "Hot 🔥" },
    { value: "extra-hot", label: "Extra Hot 🔥🔥", extra: 10 },
  ],
};

const riceChoice: CustomizationOption = {
  id: "rice",
  label: "Rice Type",
  choices: [
    { value: "white", label: "White Rice" },
    { value: "brown", label: "Brown Rice", extra: 20 },
    { value: "no-rice", label: "No Rice" },
  ],
};

const sauceChoice: CustomizationOption = {
  id: "sauce",
  label: "Extra Sauce",
  choices: [
    { value: "none", label: "None" },
    { value: "soy", label: "Extra Soy Sauce" },
    { value: "spicy-mayo", label: "Spicy Mayo", extra: 15 },
    { value: "unagi", label: "Unagi Sauce", extra: 15 },
    { value: "ponzu", label: "Ponzu" },
  ],
};

const drinkTemp: CustomizationOption = {
  id: "temp",
  label: "Temperature",
  choices: [
    { value: "hot", label: "Hot" },
    { value: "iced", label: "Iced" },
  ],
};

export const categories = [
  "All",
  "Sushi Bake",
  "Maki",
  "Specialty",
];

export const menuItems: MenuItem[] = [
  // Sushi Bake
  { id: "sb1", name: "Sushi Bake California", description: "Creamy baked California-style sushi with crab, mayo, and nori — perfect for sharing", price: 320, category: "Sushi Bake", image: "🍱", customizations: [spiceLevel, sauceChoice] },
  { id: "sb2", name: "Sushi Bake Spicy Tuna", description: "Oven-baked spicy tuna layered over seasoned sushi rice with a kick of heat", price: 290, category: "Sushi Bake", image: "🍱", customizations: [spiceLevel, sauceChoice] },
  { id: "sb3", name: "Sushi Bake 3n1", description: "Three-flavor sushi bake platter — California, Spicy Tuna & Cheesy Nigiri in one box", price: 870, category: "Sushi Bake", image: "⭐", customizations: [spiceLevel, sauceChoice] },

  // Maki
  { id: "mk1", name: "California Maki", description: "Classic maki roll with crab stick, avocado, and cucumber — 8 pieces per order", price: 240, category: "Maki", image: "🍣", customizations: [sauceChoice] },
  { id: "mk2", name: "Cheesy California Maki", description: "California maki topped with melted cheese for an extra creamy twist — 8 pieces", price: 190, category: "Maki", image: "🧀", customizations: [sauceChoice] },

  // Specialty
  { id: "sp1", name: "Sushi Cheesy Nigiri", description: "Hand-pressed nigiri topped with torched cheese and a drizzle of special sauce", price: 190, category: "Specialty", image: "🍣", customizations: [sauceChoice] },
  { id: "sp2", name: "Anori", description: "Crispy nori-wrapped sushi bites with seasoned rice and savory filling", price: 190, category: "Specialty", image: "🌿", customizations: [sauceChoice, spiceLevel] },
];
