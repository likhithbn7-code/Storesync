# StoreSync demo

## Run the working frontend

In a terminal, from this folder:

```powershell
npm install
npm run dev
```

Open the local address Vite prints (normally `http://localhost:5173`). The demo includes eight sample products, local keyword and category/price/city filters, a cart with quantity changes, and a simulated checkout confirmation. Checkout does not save an order.

## Integration status

The Aiven PostgreSQL, Kafka, and OpenSearch services were shown as **Running** in the Aiven console. StoreSync's application connections have **not been verified**. No `.env.local` credentials file was present when this package was prepared. The browser demo falls back to its local sample catalogue when the API is unavailable.

The project includes backend integration code and unit coverage for order input validation and fuzzy-search query construction. To attempt a live connection, copy `.env.example` to `.env.local`, replace the placeholders with the Aiven connection values, and provide the Aiven CA certificate at the configured path. Keep `.env.local` and certificate files private; they are excluded by `.gitignore`. Start the API with `npm run api` and the frontend separately with `npm run dev`. Verify the `/api/health` response before describing any service as integrated.

## Checks completed

- `npm test`: 2 unit tests passed.
- `npm run build`: production frontend build succeeded.
- Live PostgreSQL, Kafka, and OpenSearch connections: not verified.
