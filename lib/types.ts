export type EventStatus = "draft" | "published" | "sold_out" | "archived";
export type ReservationStatus = "new" | "confirmed" | "declined" | "completed";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "checked_in";
export type TicketStatus = "valid" | "redeemed" | "void";
export type MediaKind = "image" | "video";

export type Admin = {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  created_at: string;
};

export type EventRow = {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  doors_at: string | null;
  venue: string;
  dress_code: string;
  age_limit: string;
  status: EventStatus;
  featured: boolean;
  is_placeholder: boolean;
  cover: string;
  created_at: string;
  updated_at: string;
};

export type TicketTypeRow = {
  id: number;
  event_id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  sold: number;
  sort_order: number;
  active: boolean;
};

export type ReservationRow = {
  id: number;
  reference: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  arrival_time: string;
  guests: number;
  category: string;
  seating: string;
  requests: string;
  status: ReservationStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
};

export type BookingRow = {
  id: number;
  reference: string;
  event_id: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  total: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
};

export type BookingItemRow = {
  id: number;
  booking_id: number;
  ticket_type_id: number;
  label: string;
  unit_price: number;
  quantity: number;
};

export type TicketRow = {
  id: number;
  code: string;
  booking_id: number;
  event_id: number;
  ticket_type_id: number;
  holder_name: string;
  status: TicketStatus;
  redeemed_at: string | null;
  created_at: string;
};

export type MediaRow = {
  id: number;
  filename: string;
  mime: string;
  kind: MediaKind;
  title: string;
  caption: string;
  featured: boolean;
  created_at: string;
};

export type BookingWithEvent = BookingRow & {
  event_title: string;
  event_slug: string;
  event_starts_at: string;
};

export type EventWithTickets = EventRow & { ticket_types: TicketTypeRow[] };

export type HeroSlide = {
  mediaId: number;
  headline?: string;
  placeholder?: boolean;
};
