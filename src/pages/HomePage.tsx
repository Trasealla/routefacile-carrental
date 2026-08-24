import SearchBar from '../components/SearchBar';
import CarCard from '../components/CarCard';
import { cars } from '../data/cars';

const features = [
  { icon: '🛡️', title: 'Full Insurance', desc: 'All vehicles covered by comprehensive insurance.' },
  { icon: '🔑', title: 'Easy Booking', desc: 'Book your car in minutes, no hidden fees.' },
  { icon: '🚗', title: 'Wide Selection', desc: 'From economy to luxury, we have the right car for you.' },
  { icon: '📍', title: '8+ Locations', desc: 'Pick up and drop off across major French cities.' },
];

export default function HomePage() {
  const featured = cars.filter((c) => c.available).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Find Your Perfect Rental Car</h1>
          <p>Easy, affordable car rentals across France. Book online in minutes.</p>
          <SearchBar />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Why Choose RouteFacile?</h2>
          <p className="section-subtitle">Trusted by thousands of travellers across France.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {features.map((f) => (
              <div key={f.title} style={{ background: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="section-title">Featured Cars</h2>
          <p className="section-subtitle">Hand-picked vehicles for your next trip.</p>
          <div className="cars-grid">
            {featured.map((car) => <CarCard key={car.id} car={car} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href="/cars" className="btn btn-secondary btn-lg">View All Cars →</a>
          </div>
        </div>
      </section>
    </>
  );
}
