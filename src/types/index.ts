export interface Car {
  id: string;
  name: string;
  brand: string;
  category: 'economy' | 'compact' | 'suv' | 'luxury' | 'minivan';
  seats: number;
  doors: number;
  transmission: 'automatic' | 'manual';
  fuel: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  pricePerDay: number;
  image: string;
  features: string[];
  available: boolean;
  location: string;
}

export interface Booking {
  id: string;
  carId: string;
  carName: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalPrice: number;
  createdAt: string;
}

export interface SearchFilters {
  location: string;
  pickupDate: string;
  dropoffDate: string;
  category: string;
  transmission: string;
  maxPrice: number;
}
