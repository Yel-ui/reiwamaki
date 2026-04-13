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

export interface CartItem extends MenuItem {
  quantity: number;
  customizations?: ItemCustomization;
  specialInstructions?: string;
  cartKey: string; // unique key combining id + customizations
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
  "Nigiri",
  "Maki Rolls",
  "Sashimi",
  "Temaki",
  "Donburi",
  "Sides",
  "Drinks",
];

export const menuItems: MenuItem[] = [
  // Nigiri
  { id: "n1", name: "Salmon Nigiri", description: "Fresh Atlantic salmon over seasoned rice", price: 120, category: "Nigiri", image: "🍣" },
  { id: "n2", name: "Tuna Nigiri", description: "Premium bluefin tuna, hand-pressed", price: 140, category: "Nigiri", image: "🍣" },
  { id: "n3", name: "Ebi Nigiri", description: "Butterfly shrimp, lightly torched", price: 100, category: "Nigiri", image: "🍤" },
  { id: "n4", name: "Tamago Nigiri", description: "Sweet Japanese egg omelette", price: 80, category: "Nigiri", image: "🍣" },

  // Maki Rolls
  { id: "m1", name: "California Roll", description: "Crab, avocado, cucumber — 8 pcs", price: 220, category: "Maki Rolls", image: "🍱" },
  { id: "m2", name: "Spicy Tuna Roll", description: "Tuna, spicy mayo, tempura flakes — 8 pcs", price: 260, category: "Maki Rolls", image: "🍱" },
  { id: "m3", name: "Dragon Roll", description: "Eel, avocado, unagi sauce — 8 pcs", price: 320, category: "Maki Rolls", image: "🐉" },
  { id: "m4", name: "Rainbow Roll", description: "Assorted fish on California roll — 8 pcs", price: 350, category: "Maki Rolls", image: "🌈" },
  { id: "m5", name: "Rei Wa Special Roll", description: "Chef's signature, torched salmon, truffle — 8 pcs", price: 420, category: "Maki Rolls", image: "⭐" },

  // Sashimi
  { id: "s1", name: "Salmon Sashimi", description: "5 slices of premium salmon", price: 280, category: "Sashimi", image: "🐟" },
  { id: "s2", name: "Tuna Sashimi", description: "5 slices of bluefin tuna", price: 320, category: "Sashimi", image: "🐟" },
  { id: "s3", name: "Mixed Sashimi Platter", description: "12 slices of assorted fish", price: 550, category: "Sashimi", image: "🐟" },

  // Temaki
  { id: "t1", name: "Salmon Temaki", description: "Hand roll with salmon & cream cheese", price: 150, category: "Temaki", image: "🌮" },
  { id: "t2", name: "Tuna Temaki", description: "Hand roll with spicy tuna", price: 160, category: "Temaki", image: "🌮" },

  // Donburi
  { id: "d1", name: "Chirashi Don", description: "Assorted sashimi over sushi rice", price: 380, category: "Donburi", image: "🍚" },
  { id: "d2", name: "Salmon Don", description: "Generous salmon over warm rice", price: 300, category: "Donburi", image: "🍚" },
  { id: "d3", name: "Unagi Don", description: "Grilled eel with sweet sauce over rice", price: 350, category: "Donburi", image: "🍚" },

  // Sides
  { id: "si1", name: "Edamame", description: "Steamed & salted soybeans", price: 80, category: "Sides", image: "🫛" },
  { id: "si2", name: "Miso Soup", description: "Traditional dashi broth, tofu, wakame", price: 60, category: "Sides", image: "🥣" },
  { id: "si3", name: "Gyoza (5 pcs)", description: "Pan-fried pork dumplings", price: 140, category: "Sides", image: "🥟" },
  { id: "si4", name: "Tempura Assortment", description: "Shrimp & vegetable tempura", price: 220, category: "Sides", image: "🍤" },

  // Drinks
  { id: "dr1", name: "Green Tea", description: "Hot or iced Japanese green tea", price: 50, category: "Drinks", image: "🍵" },
  { id: "dr2", name: "Ramune Soda", description: "Classic Japanese marble soda", price: 70, category: "Drinks", image: "🥤" },
  { id: "dr3", name: "Calpis", description: "Refreshing yogurt-based drink", price: 70, category: "Drinks", image: "🥛" },
];
