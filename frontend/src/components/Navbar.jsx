import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/todo">To Do List</Link>
      <Link to="/contact">Nos contacts</Link>
    </nav>
  );
}

export default Navbar;