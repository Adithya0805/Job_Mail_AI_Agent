# Firebase Admin SDK lazy initialization setup
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
import os

_firebase_app = None

def get_firebase_app():
    global _firebase_app
    if _firebase_app is None:
        service_account_path = os.getenv(
            'GOOGLE_APPLICATION_CREDENTIALS',
            'firebase-service-account.json'
        )
        cred = credentials.Certificate(service_account_path)
        _firebase_app = firebase_admin.initialize_app(cred)
    return _firebase_app

def verify_firebase_token(id_token: str) -> dict:
    get_firebase_app()
    decoded = firebase_auth.verify_id_token(id_token)
    return {
        'uid': decoded['uid'],
        'email': decoded.get('email'),
        'name': decoded.get('name'),
    }
