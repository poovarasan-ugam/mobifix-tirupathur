import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createOrder } from "@/lib/firestore";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    items,
    total,
    customer,
  } = body;

  // Verify the payment signature server-side — never trust the client alone.
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
  }

  const orderRef = await createOrder({
    items: items.map((i: any) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      qty: i.qty,
    })),
    total,
    customerName: customer.name,
    phone: customer.phone,
    address: customer.address,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    status: "paid",
  });

  return NextResponse.json({ success: true, orderId: orderRef.id });
}
