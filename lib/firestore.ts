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
  images: string[];
  stock: number;
  category: string;
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

// ---- Products ----
export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(
    query(collection(db, "products"), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }));
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Product, "id">) };
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
