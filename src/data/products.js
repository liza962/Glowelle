/** Skincare catalog for the homepage */
export function productImageUrl(slug) {
  return `https://cdn.media.amplience.net/i/deciem/${slug}?fmt=auto&$poi$&sm=aspect&w=500&aspect=4:3`;
}

const AMPLIENCE_WORKING_SLUGS = [
  "Shop-by-step-img1",
  "Shop-by-step-img2",
  "Shop-by-step-img3",
];

export function productImageUrlForCatalogId(id) {
  return productImageUrl(AMPLIENCE_WORKING_SLUGS[(id - 1) % AMPLIENCE_WORKING_SLUGS.length]);
}

export const PRODUCTS = [
  {
    id: 1,
    name: "Cloud Cream Cleanser",
    category: "Cleansers",
    description: "Soft foam that removes makeup without stripping moisture.",
    price: 22,
    image: productImageUrlForCatalogId(1),
  },
  {
    id: 2,
    name: "Micellar Water — Sensitive",
    category: "Cleansers",
    description: "No-rinse cleanse for reactive skin; fragrance-free.",
    price: 18,
    image: productImageUrlForCatalogId(2),
  },
  {
    id: 3,
    name: "Balancing Gel Cleanser",
    category: "Cleansers",
    description: "Light gel for combination skin; refines without dryness.",
    price: 24,
    image: productImageUrlForCatalogId(3),
  },
  {
    id: 4,
    name: "Barrier Repair Cream",
    category: "Moisturizers",
    description: "Ceramide-rich cream for overnight recovery.",
    price: 38,
    image: productImageUrlForCatalogId(4),
  },
  {
    id: 5,
    name: "Hydra-Gel Moisturizer",
    category: "Moisturizers",
    description: "Oil-free gel-cream for oily and humid climates.",
    price: 32,
    image: productImageUrlForCatalogId(5),
  },
  {
    id: 6,
    name: "Rich Night Balm",
    category: "Moisturizers",
    description: "Buttery balm for very dry or mature skin.",
    price: 45,
    image: productImageUrlForCatalogId(6),
  },
  {
    id: 7,
    name: "Vitamin C Bright Serum",
    category: "Serums",
    description: "15% L-ascorbic for radiance and uneven tone.",
    price: 42,
    image: productImageUrlForCatalogId(7),
  },
  {
    id: 8,
    name: "Niacinamide 10% Serum",
    category: "Serums",
    description: "Minimizes pores and balances oil over time.",
    price: 28,
    image: productImageUrlForCatalogId(8),
  },
  {
    id: 9,
    name: "Hyaluronic Acid Drops",
    category: "Serums",
    description: "Multi-weight HA for plump, dewy skin.",
    price: 26,
    image: productImageUrlForCatalogId(9),
  },
  {
    id: 10,
    name: "Retinol Night Complex",
    category: "Serums",
    description: "Encapsulated retinol for fine lines; start slow.",
    price: 48,
    image: productImageUrlForCatalogId(10),
  },
  {
    id: 11,
    name: "Mineral SPF 50 Fluid",
    category: "Sun Care",
    description: "Sheer zinc oxide; no white cast on medium tones.",
    price: 34,
    image: productImageUrlForCatalogId(11),
  },
  {
    id: 12,
    name: "SPF 30 Glow Lotion",
    category: "Sun Care",
    description: "Daily UV + subtle pearlescence under makeup.",
    price: 30,
    image: productImageUrlForCatalogId(12),
  },
  {
    id: 13,
    name: "Clay Purifying Mask",
    category: "Masks",
    description: "Kaolin + charcoal for weekly deep cleanse.",
    price: 29,
    image: productImageUrlForCatalogId(13),
  },
  {
    id: 14,
    name: "Overnight Jelly Mask",
    category: "Masks",
    description: "Sleeping mask with panthenol; wake up supple.",
    price: 31,
    image: productImageUrlForCatalogId(14),
  },
  {
    id: 15,
    name: "Hydrating Sheet Mask (5 pack)",
    category: "Masks",
    description: "Soothing essence masks for travel or after peels.",
    price: 20,
    image: productImageUrlForCatalogId(15),
  },
  {
    id: 16,
    name: "Rose Water Toner",
    category: "Toners",
    description: "Alcohol-free mist to prep skin after cleansing.",
    price: 19,
    image: productImageUrlForCatalogId(16),
  },
  {
    id: 17,
    name: "BHA Clarifying Toner",
    category: "Toners",
    description: "2% salicylic for texture and clogged pores.",
    price: 27,
    image: productImageUrlForCatalogId(17),
  },
  {
    id: 18,
    name: "Essence First Treatment",
    category: "Toners",
    description: "Ferment essence to boost absorption of serums.",
    price: 36,
    image: productImageUrlForCatalogId(18),
  },
];

/** Sorted unique categories for filters */
export const PRODUCT_CATEGORIES = [
  ...new Set(PRODUCTS.map((p) => p.category)),
].sort((a, b) => a.localeCompare(b));
