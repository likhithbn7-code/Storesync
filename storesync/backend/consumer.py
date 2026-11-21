import os
import sys
import json
import signal
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from opensearchpy import OpenSearch
from kafka import KafkaConsumer

# Load environment variables
backend_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(backend_dir, ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)
else:
    load_dotenv()

POSTGRES_URI = os.getenv("POSTGRES_URI")
OPENSEARCH_URI = os.getenv("OPENSEARCH_URI")
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "order-events")
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID", "storesync-inventory-group")

# SSL certificates for Aiven Kafka
certs_dir = os.path.join(backend_dir, "certs")
ca_file = os.path.join(certs_dir, "ca.pem")
cert_file = os.path.join(certs_dir, "service.cert")
key_file = os.path.join(certs_dir, "service.key")


def ensure_kafka_certs():
    """Recreates certs from environment variables if missing on disk."""
    os.makedirs(certs_dir, exist_ok=True)
    os.makedirs("certs", exist_ok=True)
    mapping = {
        ca_file: os.getenv("KAFKA_CA_PEM"),
        cert_file: os.getenv("KAFKA_SERVICE_CERT"),
        key_file: os.getenv("KAFKA_SERVICE_KEY"),
    }
    recreated = []
    for file_path, env_val in mapping.items():
        if env_val and env_val.strip():
            if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
                try:
                    content = env_val.strip().strip("'").strip('"')
                    if "\\n" in content:
                        content = content.replace("\\n", "\n")
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(content + "\n")
                    recreated.append(os.path.basename(file_path))
                    # Also write to local ./certs/ if cwd is different from backend_dir
                    local_path = os.path.join("certs", os.path.basename(file_path))
                    if os.path.abspath(local_path) != os.path.abspath(file_path):
                        with open(local_path, "w", encoding="utf-8") as lf:
                            lf.write(content + "\n")
                except Exception as e:
                    print(f"[WARN] Failed to write certificate {file_path}: {e}")
        elif os.path.exists(file_path):
            local_path = os.path.join("certs", os.path.basename(file_path))
            if os.path.abspath(local_path) != os.path.abspath(file_path) and (not os.path.exists(local_path) or os.path.getsize(local_path) == 0):
                try:
                    with open(file_path, "r", encoding="utf-8") as rf, open(local_path, "w", encoding="utf-8") as wf:
                        wf.write(rf.read())
                except Exception:
                    pass
    if recreated:
        print(f"[BOOT] Recreated Kafka SSL certs from environment variables: {', '.join(recreated)}")


ensure_kafka_certs()

running = True


def signal_handler(sig, frame):
    global running
    print("\n[Kafka Consumer] Gracefully shutting down...")
    running = False


signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


def get_opensearch_client():
    if not OPENSEARCH_URI or "YOUR_" in OPENSEARCH_URI or "REPLACE_ME" in OPENSEARCH_URI:
        return None
    try:
        return OpenSearch(
            hosts=[OPENSEARCH_URI],
            http_compress=True,
            use_ssl=True,
            verify_certs=True,
            ssl_assert_hostname=False,
            ssl_show_warn=False,
            timeout=5,
        )
    except Exception as e:
        print(f"[WARN] OpenSearch connection failed: {e}")
        return None


def sync_product_stock_to_opensearch(os_client, pg_conn, product_id):
    """Sync updated stock from PostgreSQL directly into OpenSearch product document."""
    if not os_client or not pg_conn:
        return
    try:
        cur = pg_conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, name, description, category, price, city, stock, image_url FROM products WHERE id = %s;", (product_id,))
        p = cur.fetchone()
        cur.close()

        if p:
            doc = {
                "id": int(p["id"]),
                "name": p["name"],
                "description": p["description"],
                "category": p["category"],
                "city": p["city"],
                "price": float(p["price"]),
                "stock": int(p["stock"]),
                "image_url": p["image_url"],
            }
            os_client.index(
                index="products",
                id=str(p["id"]),
                body=doc,
                refresh=True,
            )
            print(f"  -> [OpenSearch] Synced Product #{p['id']} ('{p['name']}') stock to {p['stock']}.")
    except Exception as e:
        print(f"  -> [WARN] Failed to sync stock to OpenSearch for product #{product_id}: {e}")


def mark_order_status(pg_conn, order_id, new_status):
    """Update order status in PostgreSQL."""
    if not pg_conn:
        return
    try:
        cur = pg_conn.cursor()
        cur.execute("UPDATE orders SET status = %s WHERE id = %s;", (new_status, order_id))
        pg_conn.commit()
        cur.close()
        print(f"  -> [PostgreSQL] Order #{order_id} status updated to '{new_status}'.")
    except Exception as e:
        print(f"  -> [WARN] Failed to update order #{order_id} in PostgreSQL: {e}")


def start_consumer():
    print("=" * 65)
    print(" StoreSync Aiven Apache Kafka Consumer")
    print(f" Topic:    {KAFKA_TOPIC}")
    print(f" Group ID: {KAFKA_GROUP_ID}")
    print(" Handling: ORDER_PLACED & ORDER_CANCELLED (Stock Sync to OpenSearch)")
    print("=" * 65)

    if not KAFKA_BOOTSTRAP_SERVERS or "YOUR_" in KAFKA_BOOTSTRAP_SERVERS or "HOST:PORT" in KAFKA_BOOTSTRAP_SERVERS:
        print("[WARN] KAFKA_BOOTSTRAP_SERVERS contains placeholder credentials. Update storesync/backend/.env with your Aiven credentials.")
        return

    os_client = get_opensearch_client()
    pg_conn = None
    if POSTGRES_URI and not any(ph in POSTGRES_URI for ph in ["YOUR_", "HOST:PORT"]):
        try:
            pg_conn = psycopg2.connect(POSTGRES_URI)
            print("[INFO] Connected to Aiven PostgreSQL.")
        except Exception as e:
            print(f"[WARN] PostgreSQL connection failed: {e}")

    try:
        consumer = KafkaConsumer(
            KAFKA_TOPIC,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS.split(","),
            group_id=KAFKA_GROUP_ID,
            auto_offset_reset="earliest",
            enable_auto_commit=True,
            security_protocol="SSL",
            ssl_cafile=ca_file,
            ssl_certfile=cert_file,
            ssl_keyfile=key_file,
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
            consumer_timeout_ms=1000,
        )
        print("[INFO] Connected to Aiven Apache Kafka cluster.")
        print("[INFO] Listening for order events... (Press Ctrl+C to exit)\n")

        while running:
            records = consumer.poll(timeout_ms=1000)
            for topic_partition, messages in records.items():
                for message in messages:
                    event = message.value
                    event_type = event.get("event_type")
                    order_id = event.get("order_id")
                    items = event.get("items", [])

                    print(f"\n[EVENT RECEIVED] {event_type} | Order #{order_id}")
                    print(f"  Partition: {message.partition} | Offset: {message.offset}")

                    if event_type == "ORDER_PLACED":
                        # 1. Update each ordered product's stock in OpenSearch
                        for it in items:
                            p_id = it.get("product_id")
                            if p_id:
                                sync_product_stock_to_opensearch(os_client, pg_conn, p_id)
                        print(f"[SUCCESS] Processed ORDER_PLACED for Order #{order_id} -> OpenSearch stock synced.\n")

                    elif event_type == "ORDER_CANCELLED":
                        # 2. Resync restored stock into OpenSearch
                        for it in items:
                            p_id = it.get("product_id")
                            if p_id:
                                sync_product_stock_to_opensearch(os_client, pg_conn, p_id)
                        if order_id:
                            mark_order_status(pg_conn, order_id, "CANCELLED")
                        print(f"[SUCCESS] Processed ORDER_CANCELLED for Order #{order_id} -> Restored stock synced to OpenSearch.\n")

                    elif event_type == "LOW_STOCK_ALERT":
                        p_id = event.get("product_id")
                        p_name = event.get("product_name")
                        rem = event.get("remaining_stock")
                        print(f"  🔥 [SCARCITY TRIGGER] Product #{p_id} ('{p_name}') critically low: {rem} left in Aiven PostgreSQL.\n")

        consumer.close()
        if pg_conn:
            pg_conn.close()
        print("[Kafka Consumer] Closed all connections cleanly.")

    except Exception as e:
        print(f"[ERROR] Consumer error: {e}")
        if pg_conn:
            pg_conn.close()
        sys.exit(1)


if __name__ == "__main__":
    start_consumer()
