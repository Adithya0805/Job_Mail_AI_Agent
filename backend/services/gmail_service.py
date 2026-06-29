import os
import base64
import httpx
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class TokenExpiredError(Exception):
    pass

class GmailSendError(Exception):
    pass

class GmailService:
    def __init__(self):
        self.client_id = os.environ.get("GOOGLE_CLIENT_ID")
        self.client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")

    def build_mime_message(self, to: str, subject: str, body: str, from_name: str, from_email: str) -> str:
        """Constructs a MIME email message and returns a base64url encoded string"""
        message = MIMEMultipart()
        message["to"] = to
        message["from"] = f"{from_name} <{from_email}>"
        message["subject"] = subject
        
        msg = MIMEText(body, "plain")
        message.attach(msg)
        
        # Base64url encode the raw string
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        return raw

    async def send_email(self, gmail_access_token: str, to: str, subject: str, body: str, from_name: str, from_email: str) -> dict:
        """Builds message and calls Gmail API to send"""
        raw_message = self.build_mime_message(to, subject, body, from_name, from_email)
        
        url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
        headers = {
            "Authorization": f"Bearer {gmail_access_token}",
            "Content-Type": "application/json"
        }
        payload = {
            "raw": raw_message
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            
            if response.status_code == 401:
                raise TokenExpiredError("Gmail access token is expired or invalid")
            
            if response.status_code != 200:
                raise GmailSendError(f"Gmail API error: {response.text}")
                
            data = response.json()
            return {
                "status": "sent",
                "message_id": data.get("id"),
                "thread_id": data.get("threadId"),
                "to": to,
                "subject": subject
            }

    async def refresh_access_token(self, refresh_token: str) -> str:
        """Call Google OAuth endpoint to refresh access token"""
        if not self.client_id or not self.client_secret:
            raise Exception("Missing Google OAuth client credentials in environment")
            
        url = "https://oauth2.googleapis.com/token"
        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=payload)
            if response.status_code != 200:
                raise Exception(f"Failed to refresh Google token: {response.text}")
                
            return response.json().get("access_token")
