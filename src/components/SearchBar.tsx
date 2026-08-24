import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { locations } from '../data/cars';

export default function SearchBar() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    location: '',
    pickupDate: today,
    dropoffDate: tomorrow,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    const params = new URLSearchParams(form);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div className="search-box">
      <div className="search-grid">
        <div className="form-group">
          <label>Pickup Location</label>
          <select name="location" value={form.location} onChange={handleChange}>
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Pick-up Date</label>
          <input type="date" name="pickupDate" value={form.pickupDate} min={today} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Return Date</label>
          <input type="date" name="dropoffDate" value={form.dropoffDate} min={form.pickupDate} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>&nbsp;</label>
          <button className="btn btn-primary btn-full" onClick={handleSearch}>
            🔍 Search Cars
          </button>
        </div>
      </div>
    </div>
  );
}
