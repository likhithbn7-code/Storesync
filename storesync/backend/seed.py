import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
from opensearchpy import OpenSearch
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

# Load environment variables explicitly from .env
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=dotenv_path, override=True)

POSTGRES_URI = os.getenv("POSTGRES_URI")
OPENSEARCH_URI = os.getenv("OPENSEARCH_URI")

if not POSTGRES_URI:
    print("[ERROR] POSTGRES_URI is not set in storesync/backend/.env")
    sys.exit(1)

if not OPENSEARCH_URI:
    print("[ERROR] OPENSEARCH_URI is not set in storesync/backend/.env")
    sys.exit(1)

# 16 realistic Indian retail products across 4 categories and 4 major Indian cities
# Includes items with "Bluetooth" for typo search demo ("bluetoth")
# Stock = 1 on at least 2 products for concurrency protection demo
SEED_PRODUCTS = [
    # Electronics
    {
        "name": "boAt Rockerz 550 Bluetooth Headphones",
        "description": "Powerful over-ear Bluetooth wireless headphones with 50mm dynamic drivers, physical noise isolation, and up to 20 hours playback.",
        "category": "Electronics",
        "price": 1999.00,
        "city": "Bengaluru",
        "stock": 15,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Noise Pulse 2 Max Bluetooth Calling Smartwatch",
        "description": "Feature-packed 1.85-inch display Bluetooth calling smartwatch with 550 nits brightness, heart rate monitor, and 100 sports modes.",
        "category": "Electronics",
        "price": 2499.00,
        "city": "Mumbai",
        "stock": 20,
        "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Zebronics Juke Bar 3900 Bluetooth Soundbar",
        "description": "High-fidelity 80W RMS Bluetooth soundbar with dedicated wired subwoofer, HDMI ARC, optical input, and immersive Indian cinema sound.",
        "category": "Electronics",
        "price": 4499.00,
        "city": "Delhi",
        "stock": 8,
        "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Sony WH-1000XM5 Bluetooth ANC Headphones",
        "description": "Industry-leading noise canceling Bluetooth wireless headphones with two processors, 8 microphones, LDAC audio, and 30-hour battery.",
        "category": "Electronics",
        "price": 26990.00,
        "city": "Hyderabad",
        "stock": 1,  # Stock = 1 for concurrency protection demo
        "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=85",
    },

    # Fashion
    {
        "name": "FabIndia Handcrafted Cotton Kurta",
        "description": "Pure breathable handcrafted cotton long kurta styled for festive occasions and casual traditional wear across India.",
        "category": "Fashion",
        "price": 1890.00,
        "city": "Delhi",
        "stock": 25,
        "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "WROGN Slim Fit Indigo Denim Jacket",
        "description": "Rugged washed indigo denim trucker jacket featuring signature metal buttons and a modern tailored fit.",
        "category": "Fashion",
        "price": 2799.00,
        "city": "Bengaluru",
        "stock": 12,
        "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Kanjeevaram Pure Silk Zari Saree",
        "description": "Authentic handwoven Kanchipuram pure silk saree with heavy gold zari pallu and rich bridal border.",
        "category": "Fashion",
        "price": 14500.00,
        "city": "Hyderabad",
        "stock": 1,  # Stock = 1 for concurrency protection demo
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Manyavar Embroidered Silk Blend Nehru Jacket",
        "description": "Sophisticated textured raw silk blend Nehru jacket with ornate mandarin collar and matching pocket square.",
        "category": "Fashion",
        "price": 3999.00,
        "city": "Mumbai",
        "stock": 10,
        "image_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=85",
    },

    # Home & Kitchen
    {
        "name": "Prestige Iris 750W Mixer Grinder",
        "description": "Heavy-duty 750-watt Indian kitchen mixer grinder with 3 stainless steel multipurpose jars and 1 transparent juicer jar.",
        "category": "Home & Kitchen",
        "price": 3299.00,
        "city": "Bengaluru",
        "stock": 18,
        "image_url": "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Milton Thermosteel 1000ml Flask",
        "description": "Double-wall vacuum insulated stainless steel hot and cold flask bottle, preserving temperature for over 24 hours.",
        "category": "Home & Kitchen",
        "price": 1099.00,
        "city": "Mumbai",
        "stock": 30,
        "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Hawkins Futura Hard Anodised Cookware Set",
        "description": "Premium 3-piece hard anodised induction non-stick cookware set including frying pan, deep kadhai, and saucepan.",
        "category": "Home & Kitchen",
        "price": 4850.00,
        "city": "Delhi",
        "stock": 14,
        "image_url": "https://images.unsplash.com/photo-1584990347449-34b7f75b7f14?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Borosil Glass Electric Kettle 1.8L",
        "description": "1500W fast boiling borosilicate glass cordless electric kettle with blue LED illumination and auto-shutoff.",
        "category": "Home & Kitchen",
        "price": 1799.00,
        "city": "Hyderabad",
        "stock": 22,
        "image_url": "https://images.unsplash.com/photo-1520970014086-2208d157c9e2?auto=format&fit=crop&w=900&q=85",
    },

    # Accessories
    {
        "name": "Titan Neo Analog Men's Watch",
        "description": "Classic contemporary quartz analog watch with bold black sunray dial and polished stainless steel link strap.",
        "category": "Accessories",
        "price": 5495.00,
        "city": "Bengaluru",
        "stock": 16,
        "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Wildcraft 45L Camo Outdoor Rucksack",
        "description": "Ergonomic multi-compartment 45-liter waterproof trekking and travel backpack with integrated rain cover.",
        "category": "Accessories",
        "price": 2999.00,
        "city": "Mumbai",
        "stock": 15,
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Hidesign Handcrafted Genuine Leather Wallet",
        "description": "Vegetable-tanned genuine leather bifold wallet with 8 card slots, currency divider, and RFID-blocking protection.",
        "category": "Accessories",
        "price": 2495.00,
        "city": "Delhi",
        "stock": 20,
        "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85",
    },
    {
        "name": "Fastrack Polarized Aviator Sunglasses",
        "description": "100% UV-protected polarized green tint pilot aviator sunglasses built with a lightweight metal frame.",
        "category": "Accessories",
        "price": 1899.00,
        "city": "Hyderabad",
        "stock": 25,
        "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85",
    },
]


def seed_database():
    print("[1/2] Connecting to Aiven PostgreSQL...")
    conn = psycopg2.connect(POSTGRES_URI)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # 1. Create tables if they do not exist
    print("  - Creating tables: users, products, orders, order_items...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            auth_provider TEXT DEFAULT 'local',
            reset_token TEXT,
            reset_expires TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            price NUMERIC(10,2) NOT NULL,
            city TEXT NOT NULL,
            stock INTEGER NOT NULL CHECK (stock >= 0),
            image_url TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_city TEXT NOT NULL,
            total_amount NUMERIC(10,2) NOT NULL,
            status TEXT NOT NULL DEFAULT 'CONFIRMED',
            payment_method TEXT DEFAULT 'COD',
            user_email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
            product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
            quantity INTEGER NOT NULL,
            price NUMERIC(10,2) NOT NULL
        );
    """)

    # Ensure constraints on existing tables
    cursor.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'check_stock_non_negative'
            ) THEN
                BEGIN
                    ALTER TABLE products ADD CONSTRAINT check_stock_non_negative CHECK (stock >= 0);
                EXCEPTION WHEN others THEN
                    NULL;
                END;
            END IF;
        END $$;
    """)

    # Ensure optional columns in orders
    cursor.execute("""
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'COD';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_email TEXT;
    """)

    # 2. Clear existing demo rows
    print("  - Truncating demo rows (CASCADE)...")
    cursor.execute("TRUNCATE order_items, orders, products RESTART IDENTITY CASCADE;")

    # 3. Insert 16 products
    print(f"  - Inserting {len(SEED_PRODUCTS)} retail products...")
    inserted_products = []
    insert_sql = """
        INSERT INTO products (name, description, category, price, city, stock, image_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id, name, description, category, price, city, stock, image_url;
    """
    for p in SEED_PRODUCTS:
        cursor.execute(insert_sql, (
            p["name"],
            p["description"],
            p["category"],
            p["price"],
            p["city"],
            p["stock"],
            p["image_url"]
        ))
        row = cursor.fetchone()
        inserted_products.append(dict(row))

    # 4. Seed demo user account
    demo_email = "demo@storesync.in"
    demo_pass = "Demo@1234"
    demo_hash = generate_password_hash(demo_pass)
    cursor.execute("""
        INSERT INTO users (name, email, password_hash, auth_provider)
        VALUES ('Demo Shopper', %s, %s, 'local')
        ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
    """, (demo_email, demo_hash))
    print(f"  - Seeded demo user account: {demo_email} (Password: {demo_pass})")

    conn.commit()
    cursor.close()
    conn.close()
    print(f"[SUCCESS] Seeded {len(inserted_products)} products and demo user into Aiven PostgreSQL.")
    return inserted_products


def seed_opensearch(products):
    print("\n[2/2] Connecting to Aiven OpenSearch...")
    # OpenSearch client initialization
    os_client = OpenSearch(
        hosts=[OPENSEARCH_URI],
        http_compress=True,
        use_ssl=True,
        verify_certs=True,
        ssl_assert_hostname=False,
        ssl_show_warn=False
    )

    index_name = "products"

    # 1. Delete products index if it exists
    if os_client.indices.exists(index=index_name):
        print(f"  - Deleting existing index '{index_name}'...")
        os_client.indices.delete(index=index_name)

    # 2. Recreate with explicit mappings
    print(f"  - Creating index '{index_name}' with explicit schema mappings...")
    index_body = {
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 1,
            "analysis": {
                "analyzer": {
                    "default": {
                        "type": "standard"
                    }
                }
            }
        },
        "mappings": {
            "properties": {
                "id": {"type": "integer"},
                "name": {"type": "text"},
                "description": {"type": "text"},
                "category": {
                    "type": "text",
                    "fields": {
                        "keyword": {"type": "keyword"}
                    }
                },
                "city": {
                    "type": "text",
                    "fields": {
                        "keyword": {"type": "keyword"}
                    }
                },
                "price": {"type": "float"},
                "stock": {"type": "integer"},
                "image_url": {"type": "keyword"}
            }
        }
    }
    os_client.indices.create(index=index_name, body=index_body)

    # 3. Index all 16 products using PostgreSQL id as _id
    print(f"  - Indexing {len(products)} products into OpenSearch...")
    for p in products:
        doc = {
            "id": int(p["id"]),
            "name": p["name"],
            "description": p["description"],
            "category": p["category"],
            "city": p["city"],
            "price": float(p["price"]),
            "stock": int(p["stock"]),
            "image_url": p["image_url"]
        }
        os_client.index(
            index=index_name,
            id=str(p["id"]),
            body=doc,
            refresh=False
        )

    # Refresh index
    os_client.indices.refresh(index=index_name)
    count = os_client.count(index=index_name)["count"]
    print(f"[SUCCESS] Indexed {count} documents in Aiven OpenSearch index '{index_name}'.")


if __name__ == "__main__":
    try:
        products = seed_database()
        seed_opensearch(products)
        print("\nAll Aiven seed tasks completed successfully!")
    except Exception as e:
        print(f"\n[FATAL ERROR] {e}")
        sys.exit(1)
