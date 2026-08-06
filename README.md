# MobiFix Tirupathur

Doorstep mobile repair booking + accessories e-commerce, built with
Next.js, Firebase, and Razorpay.

## 1. Open in VS Code

1. Unzip this project.
2. Open the folder in VS Code: `File > Open Folder`.
3. Open a terminal in VS Code: `` Ctrl+` `` (or `Terminal > New Terminal`).

## 2. Install dependencies

```bash
npm install
```

## 3. Set up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. Inside the project, enable:
   - **Firestore Database** (start in test mode for development)
   - **Storage** (for product images)
   - **Authentication** → Email/Password (to protect `/admin` later)
3. Go to **Project Settings > General**, scroll to "Your apps", click the
   web icon `</>` to register a web app, and copy the config values.
4. Copy `.env.local.example` to `.env.local` and paste in the Firebase values.

## 4. Set up Razorpay

1. Sign up at [razorpay.com](https://razorpay.com).
2. Go to **Settings > API Keys** → generate **Test Mode** keys first.
3. Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and
   `NEXT_PUBLIC_RAZORPAY_KEY_ID` to `.env.local`.
4. Switch to live keys (after KYC) only once you're ready to accept real payments.

## 5. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

## 6. Add your first products

Go to `http://localhost:3000/admin/products` and add a few accessories
to see the shop populate. (Lock this route down with Firebase Auth
before going live — see step 8.)

## 7. Firestore structure

```
products/{id}     → name, description, price, images[], stock, category
bookings/{id}      → customerName, phone, address, locality, deviceType,
                     issueDescription, preferredTime, status
orders/{id}        → items[], total, customerName, phone, address,
                     razorpayOrderId, razorpayPaymentId, status
```

## 8. Before going live — checklist

- [ ] Switch Firestore security rules from test mode to locked-down rules
      (public read on `products`, public create-only on `bookings`/`orders`,
      admin-only read/write on everything else).
- [ ] Add Firebase Auth check to `/admin/*` routes so only your client can
      access the dashboard.
- [ ] Switch Razorpay from test keys to live keys.
- [ ] Add a notification (SMS via MSG91/Twilio, or email via Resend) that
      fires when a new booking or order comes in — wire this into
      `lib/firestore.ts` `createBooking`/`createOrder`, or a Firebase
      Cloud Function trigger.
- [ ] Update placeholder phone number / WhatsApp link in `components/Footer.tsx`.
- [ ] Add real product photos (upload to Firebase Storage, paste the URL
      into the admin product form).
- [ ] Deploy.

## 9. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Add all the same environment variables from `.env.local` into Vercel's
   **Settings > Environment Variables**.
4. Deploy. Vercel auto-builds on every push to `main`.

## Project structure

```
app/
  page.tsx                  Home page
  shop/                     Product listing + detail
  cart/                     Shopping cart
  checkout/                 Checkout + Razorpay payment
  repair/                   Repair services landing + booking form
  admin/                    Basic dashboard (bookings + product management)
  api/razorpay/             Order creation + payment verification
components/                 Reusable UI components
context/CartContext.tsx     Cart state (localStorage-backed)
lib/firebase.ts             Firebase init
lib/firestore.ts            Firestore read/write helpers
```
