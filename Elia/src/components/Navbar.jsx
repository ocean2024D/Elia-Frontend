import { Link } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="container">
        <div id="offScreen" className={isOpen ? "active" : ""}>
          <ul>
            <li>
              <Link to="/" onClick={toggleMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/requests" onClick={toggleMenu}>
                Requests
              </Link>
            </li>
            <li>
              <Link to="/admin" onClick={toggleMenu}>
                Admin
              </Link>
            </li>
            <li>
              <Link to="/overview" onClick={toggleMenu}>
                Overview
              </Link>
            </li>
            <li>
              <Link to="/contacts" onClick={toggleMenu}>
                Contacts
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={toggleMenu}>
                About
              </Link>
            </li>
          </ul>
        </div>
        <nav>
          <div
            className={`hamburger ${isOpen ? "active" : ""}`}
            onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
