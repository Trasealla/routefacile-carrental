import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { cars } from '../data/cars';
import type { Booking } from '../types';

function diffDays(a: string, b: string) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const car = cars.find((c) => c.id === id);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    pickupLocation: car?.location ?? '',
    dropoffLocation: car?.location ?? '',
    pickupDate: today,
    dropoffDate: tomorrow,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');

  if (!car) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h2>Car not found</h2>
        <Link to="/cars" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Cars</Link>
      </div>
    );
  }

  const days = diffDays(form.pickupDate, form.dropoffDate);
  const total = days * car.pricePerDay;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.dropoffDate < form.pickupDate) {
      setError('Return date must be on or after the pick-up date.');
      return;
    }
    const booking: Booking = {
      id: `BK${Date.now()}`,
      carId: car.id,
      carName: car.name,
      ...form,
      totalPrice: total,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('lastBooking', JSON.stringify(booking));
    navigate('/confirmation');
  };

  return (
    <div className="car-detail">
      <div className="container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/cars">Cars</Link> / {car.name}
        </nav>

        <div className="car-detail-grid">
          <div>
            <img src={car.image} alt={car.name} className="car-detail-img" />
            <div style={{ background: 'white', borderRadius: '8px', padding: '1.5rem', marginTop: '1.5rem', boxShadow: 'var(--shadow)' }}>
              <h3 style={{ marginBottom: '1rem' }}>Vehicle Details</h3>
              <div className="car-specs">
                <div className="spec-item"><span className="spec-label">Brand</span><span className="spec-value">{car.brand}</span></div>
                <div className="spec-item"><span className="spec-label">Category</span><span className="spec-value">{car.category}</span></div>
                <div className="spec-item"><span className="spec-label">Seats</span><span className="spec-value">{car.seats}</span></div>
                <div className="spec-item"><span className="spec-label">Doors</span><span className="spec-value">{car.doors}</span></div>
                <div className="spec-item"><span className="spec-label">Transmission</span><span className="spec-value">{car.transmission}</span></div>
                <div className="spec-item"><span className="spec-label">Fuel</span><span className="spec-value">{car.fuel}</span></div>
                <div className="spec-item"><span className="spec-label">Location</span><span className="spec-value">{car.location}</span></div>
                <div className="spec-item"><span className="spec-label">Status</span><span className="spec-value" style={{ color: car.available ? 'green' : 'red' }}>{car.available ? 'Available' : 'Unavailable'}</span></div>
              </div>
              <h4 style={{ marginBottom: '0.75rem' }}>Features</h4>
              <div className="features-list">
                {car.features.map((f) => <span key={f} className="badge">{f}</span>)}
              </div>
            </div>
          </div>

          <div>
            <div className="car-detail-info">
              <div className="car-card-title car-detail-title">{car.name}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                €{car.pricePerDay}<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/day</span>
              </div>
            </div>

            {!car.available ? (
              <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                This car is currently unavailable for booking.
              </div>
            ) : (
              <form className="booking-form" style={{ marginTop: '1rem' }} onSubmit={handleSubmit}>
                <h3>Book This Car</h3>
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label>Pick-up Date</label>
                    <input type="date" name="pickupDate" value={form.pickupDate} min={today} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Return Date</label>
                    <input type="date" name="dropoffDate" value={form.dropoffDate} min={form.pickupDate} onChange={handleChange} required />
                  </div>
                </div>

                <div style={{ height: '1rem' }} />

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jean" required />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Dupont" required />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="jean@example.com" required />
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Phone *</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+33 6 12 34 56 78" required />
                </div>

                <div className="booking-summary" style={{ marginTop: '1.5rem' }}>
                  <div className="summary-row"><span>Price per day</span><span>€{car.pricePerDay}</span></div>
                  <div className="summary-row"><span>Duration</span><span>{days} day{days !== 1 ? 's' : ''}</span></div>
                  <div className="summary-row summary-total"><span>Total</span><span>€{total}</span></div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg btn-full">Confirm Booking</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
