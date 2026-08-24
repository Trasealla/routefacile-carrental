import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Booking } from '../types';

export default function ConfirmationPage() {
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lastBooking');
    if (stored) setBooking(JSON.parse(stored));
  }, []);

  if (!booking) {
    return (
      <div className="container confirmation">
        <h1>No booking found</h1>
        <Link to="/cars" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Browse Cars</Link>
      </div>
    );
  }

  return (
    <div className="container confirmation">
      <div className="confirmation-icon">✅</div>
      <h1>Booking Confirmed!</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Thank you, {booking.firstName}! Your booking reference is <strong>{booking.id}</strong>.
      </p>
      <p style={{ color: 'var(--text-muted)' }}>A confirmation email will be sent to <strong>{booking.email}</strong>.</p>

      <div className="confirmation-card">
        <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Booking Summary</h3>
        {[
          ['Vehicle', booking.carName],
          ['Pick-up Date', booking.pickupDate],
          ['Return Date', booking.dropoffDate],
          ['Name', `${booking.firstName} ${booking.lastName}`],
          ['Email', booking.email],
          ['Phone', booking.phone],
        ].map(([label, value]) => (
          <div key={label} className="summary-row" style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
          </div>
        ))}
        <div className="summary-row summary-total">
          <span>Total Paid</span>
          <span style={{ color: 'var(--primary)' }}>€{booking.totalPrice}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-secondary">Back to Home</Link>
        <Link to="/cars" className="btn btn-primary">Book Another Car</Link>
      </div>
    </div>
  );
}
