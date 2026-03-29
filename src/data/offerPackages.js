/** Offer packages shown on /offers and referenced in admin Bookings. */
export const OFFER_PACKAGES = [
  {
    name: "Glow Starter",
    tagline: "Perfect for first-time clients",
    price: "€45",
    priceNote: "one-time",
    features: [
      "60-minute skin consultation",
      "Personalized home-care routine",
      "Product recommendations for your skin type",
    ],
    highlighted: false,
  },
  {
    name: "Radiance Bundle",
    tagline: "Consult + guided follow-up",
    price: "€120",
    priceNote: "package",
    badge: "Popular",
    features: [
      "Initial consultation & skin analysis",
      "Two 30-minute follow-up visits",
      "Adjusted routine as your skin responds",
      "Email support between visits",
    ],
    highlighted: true,
  },
  {
    name: "Complete Care",
    tagline: "Ongoing support & coaching",
    price: "€220",
    priceNote: "3 months",
    features: [
      "Full consultation & treatment plan",
      "Monthly check-in sessions (x3)",
      "Priority booking for add-on treatments",
      "Seasonal routine refresh",
    ],
    highlighted: false,
  },
];
