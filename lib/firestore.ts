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
