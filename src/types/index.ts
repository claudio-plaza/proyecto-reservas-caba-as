export type Cabin = {
  id: string;
  name: string;
  description: string;
  price_per_night: number;
  image_urls: string[];
  created_at: any;
};

export type Profile = {
  id: string;
  full_name: string;
  dni_number: string;
  avatar_url: string;
};

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'pending_payment' | 'pending_transfer';

export type Booking = {
  id: string;
  cabin_id: string;
  user_id: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  created_at: any;
};
