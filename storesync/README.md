# StoreSync 🛒🇮🇳
> High-performance online retail storefront for an Indian retail chain expanding pan-India, powered entirely by **Aiven Cloud Services** (**PostgreSQL**, **Apache Kafka**, and **OpenSearch**).

---

## 💻 System Prerequisites

To run this project on any laptop (Windows, macOS, or Linux), ensure the following tools are installed:

| Tool | Recommended Version | Download / Check |
|---|---|---|
| **Python** | `3.10` or `3.11+` | `python --version` (includes `pip` and `venv`) |
| **Node.js** | `18.x`, `20.x`, or `22.x` | `node --version` (includes `npm`) |
| **Git** | `2.x+` | `git --version` |

---

## 🔑 Required Credentials & SSL Certificates

StoreSync connects to live Aiven managed cloud services. Before starting, verify you have the credentials and Kafka SSL files:

### 1. Kafka SSL Certificates
Place the 3 certificate files inside `backend/certs/`:
- `backend/certs/ca.pem` (Aiven Project CA certificate)
- `backend/certs/service.cert` (Access Certificate)
- `backend/certs/service.key` (Access Key)

> *These certificates can be downloaded from the **Aiven Web Console** under your Kafka service's **Overview** tab.*

### 2. Environment Variables (`backend/.env`)
Create or verify `backend/.env` (a template is provided at `backend/.env.example`):

```env
# Aiven PostgreSQL URI (with sslmode=require)
POSTGRES_URI=postgres://avnadmin:<PASSWORD>@<HOST>:<PORT>/defaultdb?sslmode=require

# Aiven OpenSearch HTTPS URI
OPENSEARCH_URI=https://avnadmin:<PASSWORD>@<HOST>:<PORT>

# Aiven Apache Kafka Bootstrap Servers (Host:Port without protocol)
KAFKA_BOOTSTRAP_SERVERS=<HOST>:<PORT>
KAFKA_TOPIC=order-events

# Flask Configuration
PORT=5000
SECRET_KEY=storesync-production-secret-key-change-me

# Optional: SMTP for real email OTP delivery (dev_otp is always returned as demo fallback)
# SMTP_EMAIL=your-email@gmail.com
# SMTP_APP_PASSWORD=your-google-app-password
```

---

## 🚀 Setup & Installation (Step-by-Step)

### Step 1: Open Terminal in `storesync/`

---

### Step 2: Set Up Python Backend

#### Windows (PowerShell):
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

#### macOS / Linux (Bash/Zsh):
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### Step 3: Seed Database & Search Index (One-Time)
With the virtual environment active inside `backend/`:

```bash
python seed.py
```

This script:
1. Connects to **Aiven PostgreSQL** and creates `products`, `orders`, `order_items`, and `users` tables.
2. Seeds **16 Indian retail products** across 4 categories (Electronics, Fashion, Home & Kitchen, Accessories) and 4 cities (Bengaluru, Mumbai, Delhi, Hyderabad) with INR pricing (`₹`).
3. Seeds the demo account (`demo@storesync.in` / `Demo@1234`).
4. Connects to **Aiven OpenSearch**, creates explicit schema mappings, and indexes all 16 products with typo-tolerant search indexing.

---

### Step 4: Set Up Frontend Storefront
From the `storesync/` directory:

```bash
npm install
```

---

## 🏃 Running the Application (3 Terminals)

Open 3 separate terminal tabs or windows:

### Terminal 1: Flask Backend API (Port 5000)
```powershell
# Windows
cd backend
.\venv\Scripts\Activate.ps1
python app.py
```
```bash
# macOS / Linux
cd backend
source venv/bin/activate
python app.py
```
> **Backend runs on:** `http://localhost:5000`

---

### Terminal 2: Apache Kafka Consumer (Real-Time OpenSearch Stock Sync)
```powershell
# Windows
cd backend
.\venv\Scripts\Activate.ps1
python consumer.py
```
```bash
# macOS / Linux
cd backend
source venv/bin/activate
python consumer.py
```
> **Consumer listens on:** Kafka topic `order-events` and updates product document stock in OpenSearch on `ORDER_PLACED` and `ORDER_CANCELLED`.

---

### Terminal 3: React Storefront (Port 5173)
```bash
npm run dev
```
> **Storefront runs on:** `http://localhost:5173`

---

## 🧪 Verification & Testing

### Run Backend Unit Tests (13 Tests)
Inside `backend/` with venv activated:
```bash
python test_backend.py
```
*Tests route validation, JSON guarantees on 404/405/500, stock endpoint, order placement validation, and password reset flows.*

### Run Frontend Production Build
Inside `storesync/`:
```bash
npm run build
```
*Compiles the React + Tailwind bundle into `dist/`.*

---

## 🎯 Demo Features & Test Accounts

- **Pre-Seeded Demo Account**:
  - Email: `demo@storesync.in`
  - Password: `Demo@1234`
  - *Or click "Continue with Google" for instant OAuth demo login.*
- **OpenSearch Typo Tolerance**:
  - Type `"bluetoth"` or `"hedphone"` in the search bar $\rightarrow$ matches boAt & Sony Bluetooth headphones.
- **ACID Last-Item Concurrency Protection**:
  - Products with `stock = 1` (e.g., *Sony WH-1000XM5 Headphones*, *Kanjeevaram Silk Saree*).
  - Open 2 browser windows $\rightarrow$ purchase the item in both tabs simultaneously $\rightarrow$ first completes, second receives immediate HTTP `409 OUT_OF_STOCK` conflict.
- **My Orders & 4-Step Tracking**:
  - Click **Orders** in the top navbar.
  - Inspect itemized products (`quantity x product name — ₹price`).
  - Click **Advance Status →** to advance `Confirmed` $\rightarrow$ `Packed` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered`.
  - Click **Cancel Order** to restore PostgreSQL inventory and dispatch `ORDER_CANCELLED` to Kafka.
- **Live Stock Sync**:
  - Polls `/api/stock` every 3 seconds to keep quantities and cart limits synchronized across multiple open browser tabs.

---

## 🛠️ Troubleshooting

| Issue | Cause & Solution |
|---|---|
| **Port 5000 already in use** | Stop existing Python process: `taskkill /F /IM python.exe` (Windows) or `lsof -ti :5000 \| xargs kill -9` (macOS/Linux). |
| **Port 5173 already in use** | Stop existing Vite process: `npx kill-port 5173` or run `npm run dev -- --port 5174`. |
| **Kafka SSL File Not Found** | Ensure `ca.pem`, `service.cert`, and `service.key` are located directly in `backend/certs/`. |
| **`psycopg2` installation error** | On macOS/Linux, install `psycopg2-binary` instead of `psycopg2` (`pip install psycopg2-binary`). |
| **Server returned non-JSON response** | Verify the Flask backend is actively running on `http://localhost:5000` in Terminal 1. |
| **PowerShell script execution disabled** | If `Activate.ps1` fails: Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in PowerShell. |
