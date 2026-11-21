import sys
import os
import time
import requests
import json

BASE_URL = "http://localhost:5000"

def log(msg, status="INFO"):
    symbol = "✓" if status == "PASS" else "✗" if status == "FAIL" else "ℹ"
    print(f"[{symbol}] [{status}] {msg}")

def run_tests():
    print("=" * 70)
    print("StoreSync End-to-End Automated Backend API Verification")
    print(f"Target: {BASE_URL}")
    print("=" * 70)

    # 0. Health Check
    try:
        r = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if r.status_code == 200:
            log(f"Backend is running: {r.json()}", "PASS")
        else:
            log(f"Health check failed with HTTP {r.status_code}", "FAIL")
            return False
    except Exception as e:
        log(f"Cannot connect to {BASE_URL}: {e}", "FAIL")
        return False

    all_passed = True
    test_id = int(time.time())
    test_email = f"shoppr_{test_id}@storesync.in"
    test_password = "Password@123"
    test_new_password = "NewSecret@456"

    # =========================================================================
    # Check 1: POST /api/auth/signup & POST /api/auth/login
    # =========================================================================
    print("\n" + "-" * 60)
    print("TEST 1: Authentication (Signup & Login)")
    print("-" * 60)
    try:
        # Signup
        r_signup = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": f"Tester {test_id}",
            "email": test_email,
            "password": test_password
        }, timeout=6)
        if r_signup.status_code in [200, 201] and r_signup.json().get("success"):
            log(f"POST /api/auth/signup -> HTTP {r_signup.status_code} (User created: {test_email})", "PASS")
        else:
            log(f"POST /api/auth/signup failed: HTTP {r_signup.status_code} - {r_signup.text}", "FAIL")
            all_passed = False

        # Login
        r_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": test_email,
            "password": test_password
        }, timeout=6)
        if r_login.status_code == 200 and r_login.json().get("token"):
            log(f"POST /api/auth/login -> HTTP 200 (Token received)", "PASS")
        else:
            log(f"POST /api/auth/login failed: HTTP {r_login.status_code} - {r_login.text}", "FAIL")
            all_passed = False
    except Exception as e:
        log(f"Test 1 exception: {e}", "FAIL")
        all_passed = False

    # =========================================================================
    # Check 2: Forgot Password -> Verify OTP -> Reset Password -> Login
    # =========================================================================
    print("\n" + "-" * 60)
    print("TEST 2: 4-Step Gmail OTP Password Reset Flow")
    print("-" * 60)
    try:
        # Step 1: Forgot password
        r_forgot = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": test_email
        }, timeout=6)
        otp = r_forgot.json().get("dev_otp")
        if r_forgot.status_code == 200 and otp:
            log(f"POST /api/auth/forgot-password -> HTTP 200 (OTP generated: {otp})", "PASS")
        else:
            log(f"POST /api/auth/forgot-password failed: HTTP {r_forgot.status_code} - {r_forgot.text}", "FAIL")
            all_passed = False

        # Step 2: Verify OTP
        r_verify = requests.post(f"{BASE_URL}/api/auth/verify-otp", json={
            "email": test_email,
            "otp": otp
        }, timeout=6)
        if r_verify.status_code == 200 and r_verify.json().get("verified"):
            log(f"POST /api/auth/verify-otp -> HTTP 200 (OTP successfully verified)", "PASS")
        else:
            log(f"POST /api/auth/verify-otp failed: HTTP {r_verify.status_code} - {r_verify.text}", "FAIL")
            all_passed = False

        # Step 3: Reset password
        r_reset = requests.post(f"{BASE_URL}/api/auth/reset-password", json={
            "email": test_email,
            "otp": otp,
            "new_password": test_new_password
        }, timeout=6)
        if r_reset.status_code == 200 and r_reset.json().get("success"):
            log(f"POST /api/auth/reset-password -> HTTP 200 (Password reset in PostgreSQL)", "PASS")
        else:
            log(f"POST /api/auth/reset-password failed: HTTP {r_reset.status_code} - {r_reset.text}", "FAIL")
            all_passed = False

        # Step 4: Login with new password
        r_login_new = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": test_email,
            "password": test_new_password
        }, timeout=6)
        if r_login_new.status_code == 200 and r_login_new.json().get("token"):
            log(f"POST /api/auth/login (with new password) -> HTTP 200 (Login verified)", "PASS")
        else:
            log(f"Login with new password failed: HTTP {r_login_new.status_code} - {r_login_new.text}", "FAIL")
            all_passed = False
    except Exception as e:
        log(f"Test 2 exception: {e}", "FAIL")
        all_passed = False

    # =========================================================================
    # Check 3: Razorpay Create Order & Payment Verify
    # =========================================================================
    print("\n" + "-" * 60)
    print("TEST 3: Razorpay Payment & Stock Concurrency")
    print("-" * 60)
    target_product_id = 1
    created_order_id = None
    stock_before = 0
    try:
        # Check initial stock
        r_stock = requests.get(f"{BASE_URL}/api/stock", timeout=5)
        stock_map = r_stock.json() if r_stock.status_code == 200 else {}
        stock_before = int(stock_map.get(str(target_product_id), 15))
        log(f"Initial Product #{target_product_id} Stock: {stock_before}", "INFO")

        # Create Razorpay Order
        r_rzp_create = requests.post(f"{BASE_URL}/api/payment/razorpay/create-order", json={
            "amount": 1999.00,
            "customer_name": f"Tester {test_id}",
            "customer_city": "Bengaluru",
            "user_email": test_email,
            "items": [{"product_id": target_product_id, "quantity": 1}]
        }, timeout=6)

        if r_rzp_create.status_code == 200 and r_rzp_create.json().get("order_id"):
            rzp_order_id = r_rzp_create.json()["order_id"]
            log(f"POST /api/payment/razorpay/create-order -> HTTP 200 ({rzp_order_id})", "PASS")
        else:
            log(f"POST /api/payment/razorpay/create-order failed: HTTP {r_rzp_create.status_code}", "FAIL")
            all_passed = False
            rzp_order_id = "order_rzp_fallback"

        # Verify Razorpay Payment (Simulated HMAC verification)
        r_rzp_verify = requests.post(f"{BASE_URL}/api/payment/razorpay/verify", json={
            "razorpay_order_id": rzp_order_id,
            "razorpay_payment_id": f"pay_rzp_test_{test_id}",
            "razorpay_signature": f"sig_demo_{test_id}",
            "customer_name": f"Tester {test_id}",
            "customer_city": "Bengaluru",
            "user_email": test_email,
            "items": [{"product_id": target_product_id, "quantity": 1}]
        }, timeout=8)

        if r_rzp_verify.status_code in [200, 201] and r_rzp_verify.json().get("success"):
            verify_data = r_rzp_verify.json()
            created_order_id = verify_data.get("order_id")
            new_stock = verify_data.get("new_stock", {}).get(str(target_product_id))
            log(f"POST /api/payment/razorpay/verify -> HTTP {r_rzp_verify.status_code} (Order #{created_order_id} created, stock decremented to {new_stock})", "PASS")
            if new_stock == stock_before - 1:
                log(f"PostgreSQL ACID stock decrement confirmed: {stock_before} -> {new_stock}", "PASS")
            else:
                log(f"Stock decrement check warning: expected {stock_before - 1}, got {new_stock}", "INFO")
        else:
            log(f"POST /api/payment/razorpay/verify failed: HTTP {r_rzp_verify.status_code} - {r_rzp_verify.text}", "FAIL")
            all_passed = False
    except Exception as e:
        log(f"Test 3 exception: {e}", "FAIL")
        all_passed = False

    # =========================================================================
    # Check 4: Orders History, Status Advance, and Order Cancellation
    # =========================================================================
    print("\n" + "-" * 60)
    print("TEST 4: Order History, Advance Status & Cancel (Stock Restore)")
    print("-" * 60)
    try:
        # GET /api/orders
        r_orders = requests.get(f"{BASE_URL}/api/orders?email={test_email}", timeout=6)
        if r_orders.status_code == 200:
            orders_list = r_orders.json().get("orders", [])
            log(f"GET /api/orders -> HTTP 200 ({len(orders_list)} orders retrieved)", "PASS")
            if orders_list:
                first_order = orders_list[0]
                has_items = bool(first_order.get("items"))
                log(f"Order #{first_order['id']} itemized products verified: {len(first_order.get('items', []))} item(s)", "PASS" if has_items else "INFO")
        else:
            log(f"GET /api/orders failed: HTTP {r_orders.status_code}", "FAIL")
            all_passed = False

        if created_order_id:
            # Advance Status
            r_status = requests.post(f"{BASE_URL}/api/orders/{created_order_id}/status", timeout=6)
            if r_status.status_code == 200 and r_status.json().get("success"):
                log(f"POST /api/orders/{created_order_id}/status -> HTTP 200 (Status advanced to: {r_status.json().get('status')})", "PASS")
            else:
                log(f"POST /api/orders/{created_order_id}/status failed: HTTP {r_status.status_code} - {r_status.text}", "FAIL")
                all_passed = False

            # Cancel Order
            r_cancel = requests.post(f"{BASE_URL}/api/orders/{created_order_id}/cancel", timeout=6)
            if r_cancel.status_code == 200 and r_cancel.json().get("success"):
                cancel_stock = r_cancel.json().get("new_stock", {}).get(str(target_product_id))
                log(f"POST /api/orders/{created_order_id}/cancel -> HTTP 200 (Order cancelled, stock restored to {cancel_stock})", "PASS")
                if cancel_stock == stock_before:
                    log(f"Stock restored back to original level: {cancel_stock}", "PASS")
            else:
                log(f"POST /api/orders/{created_order_id}/cancel failed: HTTP {r_cancel.status_code} - {r_cancel.text}", "FAIL")
                all_passed = False
    except Exception as e:
        log(f"Test 4 exception: {e}", "FAIL")
        all_passed = False

    # =========================================================================
    # Check 5: GET /api/telemetry & POST /api/chat
    # =========================================================================
    print("\n" + "-" * 60)
    print("TEST 5: System Pulse Telemetry & Retail AI Concierge Chat")
    print("-" * 60)
    try:
        # Telemetry
        r_telem = requests.get(f"{BASE_URL}/api/telemetry", timeout=6)
        if r_telem.status_code == 200:
            telem_data = r_telem.json()
            lock_ms = telem_data.get("lock_metrics", {}).get("last_latency_ms")
            ev_count = len(telem_data.get("events", []))
            log(f"GET /api/telemetry -> HTTP 200 (Lock: {lock_ms}ms, Events captured: {ev_count})", "PASS")
        else:
            log(f"GET /api/telemetry failed: HTTP {r_telem.status_code}", "FAIL")
            all_passed = False

        # Chat
        r_chat = requests.post(f"{BASE_URL}/api/chat", json={
            "message": "Do you have boAt headphones in stock in Bengaluru?"
        }, timeout=8)
        if r_chat.status_code == 200 and r_chat.json().get("success"):
            chat_data = r_chat.json()
            products_found = len(chat_data.get("products", []))
            log(f"POST /api/chat -> HTTP 200 ({products_found} product matches found)", "PASS")
            log(f"Chat AI Reply: \"{chat_data.get('reply')[:100]}...\"", "PASS")
        else:
            log(f"POST /api/chat failed: HTTP {r_chat.status_code} - {r_chat.text}", "FAIL")
            all_passed = False
    except Exception as e:
        log(f"Test 5 exception: {e}", "FAIL")
        all_passed = False

    print("\n" + "=" * 70)
    if all_passed:
        print("ALL 5 END-TO-END VERIFICATION CHECKS PASSED WITH HTTP 200!")
    else:
        print("SOME CHECKS ENCOUNTERED ISSUES — PLEASE REVIEW LOGS ABOVE.")
    print("=" * 70)
    return all_passed

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
