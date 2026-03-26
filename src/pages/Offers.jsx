import OfferPackages from "../components/OfferPackages.jsx";

export default function Offers() {
  return (
    <>
      <h1 className="display-6 fw-semibold my-3">Offers</h1>
      <p className="text-muted mb-4">
        Skincare consultations and care packages tailored to your goals. Choose
        a bundle that fits you—we&apos;ll guide you at every step.
      </p>
      <OfferPackages />
    </>
  );
}
