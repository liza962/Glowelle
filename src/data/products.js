/** Skincare catalog for the homepage */
export const PRODUCTS = [
  {
    id: 1,
    name: "Cloud Cream Cleanser",
    category: "Cleansers",
    description: "Soft foam that removes makeup without stripping moisture.",
    price: "€22",
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=280&fit=crop",
  },
  {
    id: 2,
    name: "Micellar Water — Sensitive",
    category: "Cleansers",
    description: "No-rinse cleanse for reactive skin; fragrance-free.",
    price: "€18",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=280&fit=crop",
  },
  {
    id: 3,
    name: "Balancing Gel Cleanser",
    category: "Cleansers",
    description: "Light gel for combination skin; refines without dryness.",
    price: "€24",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=280&fit=crop",
  },
  {
    id: 4,
    name: "Barrier Repair Cream",
    category: "Moisturizers",
    description: "Ceramide-rich cream for overnight recovery.",
    price: "€38",
    image:
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=280&fit=crop",
  },
  {
    id: 5,
    name: "Hydra-Gel Moisturizer",
    category: "Moisturizers",
    description: "Oil-free gel-cream for oily and humid climates.",
    price: "€32",
    image:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=280&fit=crop",
  },
  {
    id: 6,
    name: "Rich Night Balm",
    category: "Moisturizers",
    description: "Buttery balm for very dry or mature skin.",
    price: "€45",
    image:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=280&fit=crop",
  },
  {
    id: 7,
    name: "Vitamin C Bright Serum",
    category: "Serums",
    description: "15% L-ascorbic for radiance and uneven tone.",
    price: "€42",
    image:
      "https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=280&fit=crop",
  },
  {
    id: 8,
    name: "Niacinamide 10% Serum",
    category: "Serums",
    description: "Minimizes pores and balances oil over time.",
    price: "€28",
    image:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=280&fit=crop",
  },
  {
    id: 9,
    name: "Hyaluronic Acid Drops",
    category: "Serums",
    description: "Multi-weight HA for plump, dewy skin.",
    price: "€26",
    image:
      "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=280&fit=crop",
  },
  {
    id: 10,
    name: "Retinol Night Complex",
    category: "Serums",
    description: "Encapsulated retinol for fine lines; start slow.",
    price: "€48",
    image:
      "https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=280&fit=crop",
  },
  {
    id: 11,
    name: "Mineral SPF 50 Fluid",
    category: "Sun Care",
    description: "Sheer zinc oxide; no white cast on medium tones.",
    price: "€34",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=280&fit=crop",
  },
  {
    id: 12,
    name: "SPF 30 Glow Lotion",
    category: "Sun Care",
    description: "Daily UV + subtle pearlescence under makeup.",
    price: "€30",
    image:
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=280&fit=crop",
  },
  {
    id: 13,
    name: "Clay Purifying Mask",
    category: "Masks",
    description: "Kaolin + charcoal for weekly deep cleanse.",
    price: "€29",
    image:
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=280&fit=crop",
  },
  {
    id: 14,
    name: "Overnight Jelly Mask",
    category: "Masks",
    description: "Sleeping mask with panthenol; wake up supple.",
    price: "€31",
    image:
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=280&fit=crop",
  },
  {
    id: 15,
    name: "Hydrating Sheet Mask (5 pack)",
    category: "Masks",
    description: "Soothing essence masks for travel or after peels.",
    price: "€20",
    image:
      "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=280&fit=crop",
  },
  {
    id: 16,
    name: "Rose Water Toner",
    category: "Toners",
    description: "Alcohol-free mist to prep skin after cleansing.",
    price: "€19",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=280&fit=crop",
  },
  {
    id: 17,
    name: "BHA Clarifying Toner",
    category: "Toners",
    description: "2% salicylic for texture and clogged pores.",
    price: "€27",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=280&fit=crop",
  },
  {
    id: 18,
    name: "Essence First Treatment",
    category: "Toners",
    description: "Ferment essence to boost absorption of serums.",
    price: "€36",
    image:
      "https://images.unsplash.com/photo-1617897903246-719242758050?w=400&h=280&fit=crop",
  },
];

/** Sorted unique categories for filters */
export const PRODUCT_CATEGORIES = [
  ...new Set(PRODUCTS.map((p) => p.category)),
].sort((a, b) => a.localeCompare(b));
