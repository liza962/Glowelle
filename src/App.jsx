import { Link, Route, Routes } from "react-router-dom";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Home from "./pages/Home.jsx";

export default function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        {" · "}
        <Link to="/about">About us</Link>
        {" · "}
        <Link to="/contact">Contact us</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  );
}
