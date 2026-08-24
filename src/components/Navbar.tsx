import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          🚗 <span>Route</span>Facile
        </Link>
        <div className="navbar-links">
          <Link to="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/cars" className={pathname.startsWith('/cars') ? 'active' : ''}>Cars</Link>
          <Link to="/cars" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>Book Now</Link>
        </div>
      </div>
    </nav>
  );
}
