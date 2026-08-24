import { useNavigate } from 'react-router-dom';
import type { Car } from '../types';

interface Props {
  car: Car;
}

export default function CarCard({ car }: Props) {
  const navigate = useNavigate();

  return (
    <div className="car-card" onClick={() => navigate(`/cars/${car.id}`)}>
      <img src={car.image} alt={car.name} loading="lazy" />
      <div className="car-card-body">
        <div className="car-card-meta" style={{ marginBottom: '0.4rem' }}>
          <span className={`badge badge-category`}>{car.category}</span>
          <span className={`badge ${car.available ? 'badge-available' : 'badge-unavailable'}`}>
            {car.available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div className="car-card-title">{car.name}</div>
        <div className="car-card-meta">
          <span>👥 {car.seats} seats</span>
          <span>🚪 {car.doors} doors</span>
          <span>⚙️ {car.transmission}</span>
          <span>⛽ {car.fuel}</span>
        </div>
        <div className="car-card-features">
          {car.features.slice(0, 3).map((f) => (
            <span key={f} className="badge">{f}</span>
          ))}
        </div>
        <div className="car-card-footer">
          <div className="car-price">
            €{car.pricePerDay}<span>/day</span>
          </div>
          <button className="btn btn-primary">View Details</button>
        </div>
      </div>
    </div>
  );
}
