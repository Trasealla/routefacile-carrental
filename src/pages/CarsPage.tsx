import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { cars, locations } from '../data/cars';
import type { Car } from '../types';

export default function CarsPage() {
  const [searchParams] = useSearchParams();
  const [filtered, setFiltered] = useState<Car[]>(cars);
  const [category, setCategory] = useState('');
  const [transmission, setTransmission] = useState('');
  const [fuel, setFuel] = useState('');
  const [maxPrice, setMaxPrice] = useState(200);
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [showAvailable, setShowAvailable] = useState(false);

  useEffect(() => {
    let result = cars;
    if (location) result = result.filter((c) => c.location === location);
    if (category) result = result.filter((c) => c.category === category);
    if (transmission) result = result.filter((c) => c.transmission === transmission);
    if (fuel) result = result.filter((c) => c.fuel === fuel);
    if (showAvailable) result = result.filter((c) => c.available);
    result = result.filter((c) => c.pricePerDay <= maxPrice);
    setFiltered(result);
  }, [location, category, transmission, fuel, maxPrice, showAvailable]);

  const reset = () => {
    setLocation('');
    setCategory('');
    setTransmission('');
    setFuel('');
    setMaxPrice(200);
    setShowAvailable(false);
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Browse Our Fleet</h1>
        <p className="section-subtitle">Choose from our wide selection of vehicles.</p>
        <div className="filters-layout">
          <aside className="filters-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Filters</h3>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} onClick={reset}>Reset</button>
            </div>

            <div className="filter-group">
              <label>Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">All</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All</option>
                {['economy', 'compact', 'suv', 'luxury', 'minivan'].map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Transmission</label>
              <select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                <option value="">All</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Fuel Type</label>
              <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
                <option value="">All</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Max Price: €{maxPrice}/day</label>
              <input type="range" min={20} max={200} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
            </div>

            <div className="filter-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={showAvailable} onChange={(e) => setShowAvailable(e.target.checked)} />
                Available only
              </label>
            </div>
          </aside>

          <div>
            <p className="results-info">{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} found</p>
            {filtered.length === 0 ? (
              <div className="no-results">
                <p style={{ fontSize: '3rem' }}>🔍</p>
                <p>No cars match your filters. Try adjusting your search.</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={reset}>Clear Filters</button>
              </div>
            ) : (
              <div className="cars-grid">
                {filtered.map((car) => <CarCard key={car.id} car={car} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
