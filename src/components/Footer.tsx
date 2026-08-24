export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>🚗 RouteFacile</h4>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
              Your trusted car rental partner across France. Easy booking, quality vehicles.
            </p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li>Browse Cars</li>
              <li>How It Works</li>
              <li>Locations</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h4>Our Locations</h4>
            <ul>
              <li>Paris</li>
              <li>Lyon</li>
              <li>Marseille</li>
              <li>Bordeaux</li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>📞 +33 1 23 45 67 89</li>
              <li>✉️ contact@routefacile.fr</li>
              <li>🕐 24/7 Support</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} RouteFacile Car Rental. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
