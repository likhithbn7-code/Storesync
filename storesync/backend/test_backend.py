import unittest
import json
import sys
import os

backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app import app, format_product


class BackendUnitTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_format_product(self):
        doc = {
            "id": 1,
            "name": "boAt Rockerz 550 Bluetooth Headphones",
            "description": "Powerful over-ear Bluetooth wireless headphones",
            "category": "Electronics",
            "price": 1999.00,
            "city": "Bengaluru",
            "stock": 15,
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        }
        product = format_product(doc)
        self.assertEqual(product["id"], 1)
        self.assertEqual(product["name"], "boAt Rockerz 550 Bluetooth Headphones")
        self.assertEqual(product["price"], 1999.00)
        self.assertEqual(product["stock"], 15)
        self.assertEqual(product["category"], "Electronics")
        self.assertEqual(product["city"], "Bengaluru")
        self.assertEqual(product["cities"], ["Bengaluru"])

    def test_order_empty_cart(self):
        res = self.client.post("/api/orders", json={"items": []})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertIn("empty", data["message"].lower())

    def test_order_invalid_quantity(self):
        res = self.client.post("/api/orders", json={"items": [{"product_id": 1, "quantity": 0}]})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertIn("greater than zero", data["message"].lower())

    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("services", data)
        self.assertIn("postgres", data["services"])
        self.assertIn("kafka", data["services"])
        self.assertIn("opensearch", data["services"])

    def test_auth_signup_validation(self):
        res = self.client.post("/api/auth/signup", json={"name": "", "email": "", "password": ""})
        self.assertEqual(res.status_code, 400)

        res2 = self.client.post("/api/auth/signup", json={"name": "Test", "email": "test@test.com", "password": "123"})
        self.assertEqual(res2.status_code, 400)
        self.assertIn("at least 6", res2.get_json()["message"])

    def test_auth_login_validation(self):
        res = self.client.post("/api/auth/login", json={"email": "", "password": ""})
        self.assertEqual(res.status_code, 400)

    def test_auth_forgot_password_validation(self):
        res = self.client.post("/api/auth/forgot-password", json={})
        self.assertEqual(res.status_code, 400)

    def test_auth_reset_password_validation(self):
        res = self.client.post("/api/auth/reset-password", json={"email": "test@test.com", "otp": "123456", "new_password": "123"})
        self.assertEqual(res.status_code, 400)

    def test_404_returns_json(self):
        res = self.client.get("/api/nonexistent-route")
        self.assertEqual(res.status_code, 404)
        data = res.get_json()
        self.assertIsNotNone(data)
        self.assertIn("error", data)

    def test_405_returns_json(self):
        res = self.client.get("/api/auth/login")  # GET not allowed on login
        self.assertEqual(res.status_code, 405)
        data = res.get_json()
        self.assertIsNotNone(data)
        self.assertIn("error", data)

    def test_orders_get_endpoint(self):
        res = self.client.get("/api/orders")
        data = res.get_json()
        self.assertIsNotNone(data)
        self.assertIn("orders", data)

    def test_order_status_patch_and_post(self):
        res = self.client.patch("/api/orders/999/status")
        data = res.get_json()
        self.assertIsNotNone(data)
        self.assertIn(res.status_code, [404, 500])

        res2 = self.client.post("/api/orders/999/status")
        data2 = res2.get_json()
        self.assertIsNotNone(data2)
        self.assertIn(res2.status_code, [404, 500])

    def test_order_cancel_json(self):
        res = self.client.post("/api/orders/999/cancel")
        data = res.get_json()
        self.assertIsNotNone(data)
        self.assertIn(res.status_code, [404, 500])

    def test_auth_verify_otp_validation(self):
        res = self.client.post("/api/auth/verify-otp", json={})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertIn("error", data)

    def test_razorpay_create_order_validation(self):
        res = self.client.post("/api/payment/razorpay/create-order", json={"items": [], "amount": 0})
        self.assertEqual(res.status_code, 400)

        res2 = self.client.post("/api/payment/razorpay/create-order", json={"items": [{"product_id": 1}], "amount": 0})
        self.assertEqual(res2.status_code, 400)

    def test_razorpay_verify_validation(self):
        res = self.client.post("/api/payment/razorpay/verify", json={"items": []})
        self.assertEqual(res.status_code, 400)

    def test_telemetry_endpoint(self):
        res = self.client.get("/api/telemetry")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("events", data)
        self.assertIn("lock_metrics", data)
        self.assertIn("opensearch", data)
        self.assertIn("summary", data)

    def test_telemetry_simulate(self):
        res = self.client.post("/api/telemetry/simulate")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get("success"))
        self.assertIn("event", data)

    def test_chat_endpoint(self):
        res = self.client.post("/api/chat", json={"message": "Do you have bluetooth headphones in Bengaluru?"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data.get("success"))
        self.assertIn("reply", data)
        self.assertIn("products", data)


if __name__ == "__main__":
    unittest.main()
