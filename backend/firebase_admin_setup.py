# Firebase Admin SDK lazy initialization setup supporting env var JSON certificate
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
import os
import json

_firebase_app = None

def get_firebase_app():
    global _firebase_app
    if _firebase_app is None:
        sa_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
        if sa_json:
            # Parse minified service account JSON from environment variable
            sa_dict = json.loads(sa_json)
            cred = credentials.Certificate(sa_dict)
        else:
            # Fallback to local credential file for development
            cred = credentials.Certificate(
                os.getenv('GOOGLE_APPLICATION_CREDENTIALS', 'firebase-service-account.json')
            )
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
