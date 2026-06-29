import os
import httpx
from typing import Dict, Any

class SupabaseAdmin:
    def __init__(self):
        self.supabase_url = os.environ.get("SUPABASE_URL")
        self.service_key = os.environ.get("SUPABASE_SERVICE_KEY")
        
        if not self.supabase_url or not self.service_key:
            print("Warning: Supabase Admin env vars missing.")

    async def get_gmail_token(self, user_id: str) -> Dict[str, str]:
        """
        Retrieves user's OAuth provider tokens using Supabase Auth Admin API
        Endpoint: GET {SUPABASE_URL}/auth/v1/admin/users/{user_id}
        """
        url = f"{self.supabase_url}/auth/v1/admin/users/{user_id}"
        headers = {
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code != 200:
                raise Exception(f"Failed to fetch user admin data: {response.text}")
                
            user_data = response.json()
            identities = user_data.get("identities", [])
            
            for identity in identities:
                if identity.get("provider") == "google":
                    identity_data = identity.get("identity_data", {})
                    # Supabase Auth v1 stores the provider tokens in identity_data if requested
                    access_token = identity_data.get("provider_token")
                    refresh_token = identity_data.get("provider_refresh_token")
                    
                    if access_token:
                        return {
                            "access_token": access_token,
                            "refresh_token": refresh_token
                        }
            
            raise Exception("No Google provider tokens found for this user. Did they login with Gmail scopes?")
