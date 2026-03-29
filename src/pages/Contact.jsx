import ContactLocation from "../components/ContactLocation.jsx";

export default function Contact() {
  return (
    <>
      <header className="mb-4 pb-3 border-bottom">
        <h1 className="display-6 fw-semibold my-3">Contact us</h1>
        <p className="lead text-muted mb-0 col-lg-10 px-0">
          Visit us in Prishtina or find us on the map.
        </p>
      </header>
      <ContactLocation />
    </>
  );
}
