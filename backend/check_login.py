import sys
from app.core.supabase import supabase

email = "api.test.v2@example.com"
password = "ApiPassword123!"

try:
    res = supabase.auth.sign_in_with_password({"email": email, "password": password})
    print("LOGIN SUCCESS", res.session.access_token[:20])
except Exception as e:
    print("LOGIN FAILED", str(e))
