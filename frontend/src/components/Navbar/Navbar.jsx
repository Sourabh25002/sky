import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      {/* Left side: Company name in bold */}
      <div className="nav-left">
        <span className="company-name">sky</span>
      </div>

      {/* Right side: Navigation links */}
      <div className="nav-right">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <div className="nav-link dropdown" onClick={toggleDropdown}>
          Products
          <ul className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}>
            <li>
              <Link to="/ticker">Ticker</Link>
            </li>
            <li>
              <Link to="/product2">Product 2</Link>
            </li>
            <li>
              <Link to="/product3">Product 3</Link>
            </li>
          </ul>
        </div>

        <Link to="/subscribe" className="nav-link">
          Subscribe
        </Link>
        <Link to="/investor-journey" className="nav-link">
          Investor Journey
        </Link>
        <Link to="/about" className="nav-link">
          About
        </Link>
        <Link to="/support" className="nav-link">
          Support
        </Link>
        <Link to="/login" className="nav-link login-button">
          Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
