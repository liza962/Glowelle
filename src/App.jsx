import { Container, Navbar, Nav } from "react-bootstrap";
import { Link, Route, Routes } from "react-router-dom";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Home from "./pages/Home.jsx";

export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="light" expand="lg" className="mb-3">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Glowelle
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/about">
                About us
              </Nav.Link>
              <Nav.Link as={Link} to="/contact">
                Contact us
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="flex-grow-1 pb-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Container>
      <footer className="border-top bg-light py-3 mt-auto">
        <Container>
          <p className="text-center text-muted small mb-0">
            © 2026 Glowelle. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
}
