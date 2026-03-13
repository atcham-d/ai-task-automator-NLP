import os
from dotenv import load_dotenv
load_dotenv('.env')

from supabase import create_client, ClientOptions

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInN1YiI6Ijc2ZjVhOTZmLTE0YWQtNDk1NS1hZWM4LTMyMzk2MjM0YzE5YiIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJleHAiOjE3NzI4NzQ3NTUsImlhdCI6MTc3Mjg3MTE1NSwiZW1haWwiOiJ0ZXN0LnVzZXIuMTIzQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWwiOiJ0ZXN0LnVzZXIuMTIzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZnVsbF9uYW1lIjoiIiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiI3MmE1NWNmZi01NjY0LTQ3NTUtYTZhMi1lYzA1MjI2Nzk3OTEifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc3Mjg3MTE1NX1dLCJzZXNzaW9uX2lkIjoiNzZmNWE5NmYtMTRhZC00OTU1LWFlYzgtMzIzOTYyMzRjMTliIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.S1TpNuDcctaungmWopVa3pFY3Ofr_Y__4r61iWzEVdjsaEfyMV4bO8C1dtHMLLC1gKNpOPoXaCdFPlHzyzaPdQ"

opts = ClientOptions(headers={"Authorization": f"Bearer {token}"})
try:
    client = create_client(url, key, options=opts)
    res = client.table("integrations").insert({
        "user_id": "76f5a96f-14ad-4955-aec8-32396234c19b",
        "type": "trello",
        "name": "My test",
        "config": {"k":"v"}
    }).execute()
    print("SUCCESS")
    print(res.data)
except Exception as e:
    import traceback
    traceback.print_exc()
