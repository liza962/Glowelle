import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

const PILLARS = [
  {
    title: "Consultations",
    text: "Skin analysis, routine planning, and follow-ups so you're never guessing alone.",
  },
  {
    title: "Education",
    text: "Clear guidance on ingredients, when to introduce actives, and how to spot irritation early.",
  },
  {
    title: "Curated products",
    text: "Cleansers, serums, moisturizers, and sun care we trust—aligned with what we use in practice.",
  },
];

export default function About() {
  return (
    <div className="page-about">
      <header className="mb-4 pb-3 border-bottom">
        <h1 className="display-6 fw-semibold my-3">About Glowelle</h1>
        <p className="lead text-muted mb-0 col-lg-10 px-0">
          We believe your skin deserves a plan—not a one-size-fits-all routine.
          Glowelle brings professional guidance and calm, everyday care together in
          one place.
        </p>
      </header>

      <Card className="border-0 shadow-sm mb-4 overflow-hidden">
        <Row className="g-0 flex-column-reverse flex-lg-row">
          <Col lg={5} className="bg-primary bg-opacity-10">
            <div className="p-4 p-lg-5 h-100 d-flex flex-column justify-content-center">
              <h2 className="h4 mb-0 text-primary">Our story</h2>
              <hr className="my-3 opacity-25" />
              <p className="small text-muted mb-0">
                Founded to bridge expert advice and real life—because great skin is
                built with habits, not hype.
              </p>
            </div>
          </Col>
          <Col lg={7}>
            <Card.Body className="p-4 p-lg-5">
              <p className="mb-3">
                We started Glowelle for everyone who has tried endless products
                without knowing what their skin actually needs. Our studio is a
                welcoming space to ask questions, learn what works, and build a
                routine you can sustain.
              </p>
              <p className="mb-0 text-muted">
                Today we pair in-person consults with curated home-care
                recommendations—tailored to your goals, lifestyle, and budget.
              </p>
            </Card.Body>
          </Col>
        </Row>
      </Card>

      <figure className="page-about-quote border-start border-4 border-primary ps-4 py-3 mb-4">
        <blockquote className="mb-0 ps-1">
          <p className="mb-0 fst-italic text-secondary">
            &ldquo;We don&apos;t chase trends, we build routines you can keep, with
            care you can feel.&rdquo;
          </p>
        </blockquote>
        <figcaption className="blockquote-footer mt-2 mb-0 ps-1 small">
          Glowelle · our approach
        </figcaption>
      </figure>

      <div className="text-center mb-3">
        <h2 className="h5 mb-1">What we focus on</h2>
      </div>

      <Row className="g-4 mb-4">
        {PILLARS.map((item, index) => (
          <Col key={item.title} md={4}>
            <Card className="h-100 border-0 shadow-sm text-center text-md-start">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-md-start justify-content-center mb-3">
                  <span
                    className="page-about-pillar-num px-3 py-2 rounded-pill bg-primary bg-opacity-10 border border-primary border-opacity-25"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <Card.Title as="h3" className="h6 text-primary mb-3">
                  {item.title}
                </Card.Title>
                <Card.Text className="text-muted small mb-0">{item.text}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="border-primary mb-2" style={{ borderWidth: "2px" }}>
        <Card.Body className="p-4 p-md-5">
          <Row className="align-items-center g-4">
            <Col lg={8}>
              <h2 className="h5 mb-3">How we work with you</h2>
              <p className="text-muted mb-3">
                Every visit begins with listening: your history, sensitivities, and
                what you want to improve. We prioritize barrier health, sun
                protection, and steady progress over quick fixes—so when we suggest
                a step or product, you know why and how to use it safely at home.
              </p>
              <p className="text-muted mb-0">
                Whether you&apos;re managing acne, dryness, sensitivity, or simply
                want a clearer routine, we&apos;re here to help you glow with
                confidence.
              </p>
            </Col>
            <Col lg={4}>
              <div className="d-flex flex-column flex-lg-row gap-2 w-100 justify-content-lg-end align-items-stretch align-items-lg-center">
                <Button as={Link} to="/offers" className="px-4">
                  View offers
                </Button>
                <Button
                  as={Link}
                  to="/contact"
                  variant="outline-primary"
                  className="px-4"
                >
                  Contact us
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}
