import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  stock: number;
  category: string;
  createdAt: number;
};

export type Booking = {
  customerName: string;
  phone: string;
  address: string;
  locality: string;
  deviceType: string;
  issueDescription: string;
  preferredTime: string;
};

export type OrderItem = { productId: string; name: string; price: number; qty: number };

export type Order = {
  items: OrderItem[];
  total: number;
  customerName: string;
  phone: string;
  address: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: "pending" | "paid" | "failed";
};

const NEW_PRODUCT_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function isNewProduct(product: Product): boolean {
  return Date.now() - product.createdAt < NEW_PRODUCT_THRESHOLD_MS;
}

export function discountPercent(product: Product): number | null {
  if (!product.originalPrice || product.originalPrice <= product.price) return null;
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
}

function toProduct(id: string, data: any): Product {
  return {
    id,
    name: data.name,
    description: data.description,
    price: data.price,
    originalPrice: data.originalPrice ?? undefined,
    images: data.images ?? [],
    stock: data.stock,
    category: data.category,
    createdAt: data.createdAt?.toMillis?.() ?? 0,
  };
}

// ---- Products ----
export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(
    query(collection(db, "products"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => toProduct(d.id, d.data()));
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return toProduct(snap.id, snap.data());
}

// ---- Bookings (repair leads) ----
export async function createBooking(booking: Booking) {
  return addDoc(collection(db, "bookings"), {
    ...booking,
    status: "new",
    createdAt: serverTimestamp(),
  });
}

// ---- Orders ----
export async function createOrder(order: Order) {
  return addDoc(collection(db, "orders"), {
    ...order,
    createdAt: serverTimestamp(),
  });
}

// ---- Testimonials ----
export type Testimonial = {
  id: string;
  customerName: string;
  location: string;
  device: string;
  service: string;
  rating: number;
  quote: string;
  createdAt: number;
};

export async function getTestimonials(): Promise<Testimonial[]> {
  const snap = await getDocs(
    query(collection(db, "testimonials"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      customerName: data.customerName,
      location: data.location,
      device: data.device,
      service: data.service,
      rating: data.rating,
      quote: data.quote,
      createdAt: data.createdAt?.toMillis?.() ?? 0,
    };
  });
}

export function relativeTime(ms: number): string {
  const days = Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months <= 1) return "1 month ago";
  return `${months} months ago`;
}
