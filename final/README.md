# StoreSync — Frontend Handover Package for Git Repo

This package contains the **100% complete, redesigned frontend** extracted and packaged specifically for the StoreSync repository:  
`https://github.com/likhithbn7-code/Storesync.git`

---

## 🎯 What Your Teammate Needs to Do (3-Step Drop-in)

Your teammate does **NOT** need to touch or modify any backend code (`backend/app.py`, PostgreSQL, Kafka, OpenSearch). All API endpoints, payloads, and data formats match 100%.

### Step 1: Copy Files into the `storesync/` Project Folder
Copy and overwrite the following files in `storesync/`:
* `src/App.jsx` ➔ Overwrite `storesync/src/App.jsx`
* `src/main.jsx` ➔ Overwrite `storesync/src/main.jsx`
* `src/index.css` ➔ Overwrite `storesync/src/index.css`
* `index.html` ➔ Overwrite `storesync/index.html`

*(You can also keep `storesync_app_preview.html` for instant standalone browser testing).*

---

### Step 2: Run & Verify Locally

In your terminal inside `storesync/`:
```bash
# 1. Install frontend dependencies (if not already installed)
npm install

# 2. Start the Vite frontend
npm run dev

# 3. Start the Flask backend (in a separate terminal)
python backend/app.py
```
Open `http://localhost:5173`.

---

### Step 3: Git Commit & Push
```bash
git add src/ index.html
git commit -m "feat: upgrade storefront with cart-to-checkout flow, filter sidebar, auth modal, and AI assistant"
git push origin main
```

---

## 🔌 Connected Backend Endpoints

The new frontend connects to these existing endpoints in `backend/app.py`:
- `GET /api/products` — Catalog retrieval.
- `GET /api/stock` — Live real-time inventory polling.
- `GET /api/search?q={query}` — Debounced OpenSearch fuzzy search.
- `POST /api/orders` — ACID transactional order creation (handles 409 OUT_OF_STOCK).
- `GET /api/orders` — Order history tracking drawer.
- `POST /api/orders/<id>/status` — Advance order status (Confirmed ➔ Packed ➔ Out for Delivery ➔ Delivered).
- `POST /api/orders/<id>/cancel` — Order cancellation and inventory restock.
- `POST /api/auth/login` & `POST /api/auth/signup` — Authentication.
- `POST /api/auth/google` — Social authentication.
- `POST /api/auth/forgot-password` & `POST /api/auth/reset-password` — OTP password reset.
- `POST /api/chat` — StoreSync AI Assistant.

---

## 🖥️ Instant Visual Preview (Zero Setup)
Double-click `storesync_app_preview.html` in Chrome or Edge to interactively test all views, filters, cart, checkout, auth modal, and drawers immediately!
