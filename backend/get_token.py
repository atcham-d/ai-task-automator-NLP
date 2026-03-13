import os
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
anon_key = os.environ.get("SUPABASE_ANON_KEY")

admin_client = create_client(url, key)

email = "api.test.v2@example.com"
password = "ApiPassword123!"

try:
    users = admin_client.auth.admin.list_users()
    for u in users:
        if u.email == email:
            admin_client.auth.admin.delete_user(u.id)
except Exception as e:
    pass

try:
    admin_client.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True
    })
except Exception as e:
    print(f"Error creating user: {e}")

anon_client = create_client(url, anon_key)
res = anon_client.auth.sign_in_with_password({"email": email, "password": password})
print(res.session.access_token)
