import ProductCatalog from "../components/ProductCatalog.jsx";

export default function Home() {
  return (
    <>
      <section className="home-hero my-3" aria-labelledby="home-hero-title">
        <div className="home-hero-inner text-center text-md-start">
          <p className="home-hero-eyebrow text-uppercase small mb-2 mb-md-3">
            Skincare · Consults · Prishtina
          </p>
          <h1 id="home-hero-title" className="home-hero-title display-5 fw-semibold mb-3">
            Welcome to Glowelle
          </h1>
          <p className="home-hero-lead lead text-muted mb-0 mx-auto mx-md-0">
            Curated skincare and expert guidance for your best skin. Explore our
            picks below—filter by category, search by name or benefit, and flip
            through pages at your pace.
          </p>
          <ul className="home-hero-points list-unstyled d-flex flex-column flex-sm-row flex-wrap gap-2 gap-sm-4 mt-4 mb-0 small justify-content-center justify-content-md-start align-items-center align-items-md-start">
            <li>Filter by category</li>
            <li>Search products</li>
            <li>Paged browsing</li>
          </ul>
        </div>
      </section>
      <ProductCatalog />
    </>
  );
}
