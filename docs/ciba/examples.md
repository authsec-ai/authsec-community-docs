---
title: Usage Examples
sidebar_position: 6
---

# Usage Examples

Real-world examples demonstrating how to use the AuthSec CIBA SDK.

## Example 1: Voice Assistant Integration

Integrate passwordless authentication into a voice assistant application.

```python
from AuthSec_SDK import CIBAClient

class VoiceAssistant:
    def __init__(self, client_id):
        self.ciba = CIBAClient(client_id=client_id)
    
    def authenticate_user(self, email):
        """Handle voice authentication with fallback options"""
        
        method = self.ask_user("Approve via app or use a code?")
        
        if "app" in method.lower():
            # CIBA flow
            self.speak("I've sent a notification to your AuthSec app.")
            
            result = self.ciba.initiate_app_approval(email)
            approval = self.ciba.poll_for_approval(
                email, 
                result["auth_req_id"], 
                timeout=60
            )
            
            if approval["status"] == "approved":
                self.speak("You're authenticated!")
                return approval["token"]
            else:
                self.speak(f"Authentication {approval['status']}. Please try again.")
                return None
        
        else:
            # TOTP flow
            self.speak("Please tell me your 6-digit code.")
            code = self.listen_for_digits()
            
            result = self.ciba.verify_totp(email, code)
            
            if result["success"]:
                self.speak("Perfect! You're authenticated.")
                return result["token"]
            else:
                self.speak(f"Invalid code. {result['remaining']} attempts left.")
                return None
    
    def ask_user(self, question):
        """Voice input method - implement based on your assistant"""
        # Your voice recognition logic here
        pass
    
    def speak(self, message):
        """Voice output method - implement based on your assistant"""
        # Your text-to-speech logic here
        pass
    
    def listen_for_digits(self):
        """Listen for spoken digits"""
        # Your digit recognition logic here
        pass

# Usage
assistant = VoiceAssistant(client_id="alexa_skill_client_id")
token = assistant.authenticate_user("user@example.com")
```

---

## Example 2: CLI Authentication Tool

Build a command-line authentication tool with interactive prompts.

```python
from AuthSec_SDK import CIBAClient

def cli_authenticate():
    """Interactive CLI authentication"""
    
    ciba = CIBAClient(client_id="cli_app_client_id")
    
    # Get user email
    email = input("📧 Email: ")
    
    # Choose authentication method
    print("\n🔐 Authentication methods:")
    print("  1. Push notification (AuthSec app)")
    print("  2. TOTP code")
    choice = input("\nChoose (1/2): ")
    
    if choice == "1":
        # CIBA flow
        print("\n📱 Sending push notification...")
        result = ciba.initiate_app_approval(email)
        
        print("⏳ Waiting for approval...")
        approval = ciba.poll_for_approval(
            email, 
            result["auth_req_id"], 
            timeout=120
        )
        
        if approval["status"] == "approved":
            print(f"\n✅ Authenticated!")
            print(f"🎫 Token: {approval['token'][:50]}...")
            return approval["token"]
        else:
            print(f"\n❌ Authentication {approval['status']}")
            return None
    
    elif choice == "2":
        # TOTP flow
        code = input("\n🔢 Enter 6-digit code: ")
        result = ciba.verify_totp(email, code)
        
        if result["success"]:
            print(f"\n✅ Authenticated!")
            print(f"🎫 Token: {result['token'][:50]}...")
            return result["token"]
        else:
            print(f"\n❌ {result['error']} ({result['remaining']} attempts left)")
            return None

if __name__ == "__main__":
    token = cli_authenticate()
    if token:
        print("\n✓ You can now access the application!")
    else:
        print("\n✗ Authentication failed. Please try again.")
```

---

## Example 3: Non-Blocking CIBA with Threading

Implement non-blocking authentication using threads for better UX.

```python
from AuthSec_SDK import CIBAClient
import threading

class AsyncAuthHandler:
    """Handle multiple concurrent authentications"""
    
    def __init__(self, client_id):
        self.ciba = CIBAClient(client_id=client_id)
        self.pending_auths = {}
    
    def start_authentication(self, email, callback):
        """Start CIBA authentication in background thread"""
        
        # Initiate approval request
        result = self.ciba.initiate_app_approval(email)
        auth_req_id = result["auth_req_id"]
        
        # Define polling function
        def poll_thread():
            approval = self.ciba.poll_for_approval(
                email, 
                auth_req_id, 
                timeout=120
            )
            callback(email, approval)
        
        # Start polling in background
        thread = threading.Thread(target=poll_thread, daemon=True)
        thread.start()
        
        self.pending_auths[email] = thread
        return auth_req_id
    
    def cancel_authentication(self, email):
        """Cancel pending authentication"""
        if email in self.pending_auths:
            self.ciba.cancel_approval(email)
            del self.pending_auths[email]

# Usage example
def on_auth_complete(email, result):
    """Callback when authentication completes"""
    if result["status"] == "approved":
        print(f"✓ User {email} authenticated!")
        print(f"Token: {result['token'][:50]}...")
    else:
        print(f"✗ Auth failed for {email}: {result['status']}")

# Create handler
handler = AsyncAuthHandler(client_id="your_client_id")

# Start authentication (non-blocking)
auth_req_id = handler.start_authentication(
    "user@example.com", 
    on_auth_complete
)
print(f"Authentication started with ID: {auth_req_id}")

# Your app continues running...
print("App is still responsive!")

# Optionally cancel
# handler.cancel_authentication("user@example.com")
```

---

## Example 4: Web Application Integration

Integrate with a Flask web application.

```python
from flask import Flask, request, jsonify, session
from AuthSec_SDK import CIBAClient
import threading

app = Flask(__name__)
app.secret_key = "your-secret-key"

ciba = CIBAClient(client_id="web_app_client_id")
pending_auths = {}

@app.route("/api/auth/initiate", methods=["POST"])
def initiate_auth():
    """Initiate CIBA authentication"""
    email = request.json.get("email")
    
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    try:
        result = ciba.initiate_app_approval(email)
        
        # Store auth_req_id in session
        session["auth_req_id"] = result["auth_req_id"]
        session["email"] = email
        
        return jsonify({
            "auth_req_id": result["auth_req_id"],
            "message": "Push notification sent"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/status", methods=["GET"])
def check_auth_status():
    """Check authentication status (called by frontend polling)"""
    auth_req_id = session.get("auth_req_id")
    email = session.get("email")
    
    if not auth_req_id or not email:
        return jsonify({"error": "No pending authentication"}), 400
    
    try:
        # Non-blocking status check (poll once)
        approval = ciba.poll_for_approval(
            email, 
            auth_req_id, 
            interval=1, 
            timeout=1
        )
        
        if approval["status"] == "approved":
            session["token"] = approval["token"]
            return jsonify({
                "status": "approved",
                "token": approval["token"]
            })
        else:
            return jsonify({"status": approval["status"]})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/totp", methods=["POST"])
def verify_totp():
    """Verify TOTP code"""
    email = request.json.get("email")
    code = request.json.get("code")
    
    if not email or not code:
        return jsonify({"error": "Email and code required"}), 400
    
    try:
        result = ciba.verify_totp(email, code)
        
        if result["success"]:
            session["token"] = result["token"]
            return jsonify({
                "success": True,
                "token": result["token"]
            })
        else:
            return jsonify({
                "success": False,
                "error": result["error"],
                "remaining": result["remaining"]
            }), 400
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
```

---

## Example 5: Retry Logic with Fallback

Implement robust authentication with automatic retry and fallback to TOTP.

```python
from AuthSec_SDK import CIBAClient
import time

class RobustAuthenticator:
    def __init__(self, client_id):
        self.ciba = CIBAClient(client_id=client_id)
    
    def authenticate(self, email, max_retries=2):
        """Authenticate with automatic retry and TOTP fallback"""
        
        # Try CIBA first
        for attempt in range(max_retries):
            try:
                print(f"Attempt {attempt + 1}: Sending push notification...")
                
                result = self.ciba.initiate_app_approval(email)
                approval = self.ciba.poll_for_approval(
                    email, 
                    result["auth_req_id"], 
                    timeout=60
                )
                
                if approval["status"] == "approved":
                    print("✓ Authenticated via push notification")
                    return approval["token"]
                
                elif approval["status"] == "access_denied":
                    print("User denied the request")
                    break  # Don't retry if user explicitly denied
                
                else:
                    print(f"Failed: {approval['status']}")
                    if attempt < max_retries - 1:
                        print("Retrying in 5 seconds...")
                        time.sleep(5)
            
            except Exception as e:
                print(f"Error: {e}")
                if attempt < max_retries - 1:
                    time.sleep(5)
        
        # Fallback to TOTP
        print("\nFalling back to TOTP authentication...")
        return self.totp_fallback(email)
    
    def totp_fallback(self, email, max_attempts=3):
        """TOTP authentication with retry limit"""
        
        for attempt in range(max_attempts):
            code = input(f"Enter 6-digit code (attempt {attempt + 1}/{max_attempts}): ")
            
            result = self.ciba.verify_totp(email, code)
            
            if result["success"]:
                print("✓ Authenticated via TOTP")
                return result["token"]
            else:
                print(f"✗ {result['error']} ({result['remaining']} attempts left)")
                
                if result["remaining"] == 0:
                    print("Too many failed attempts. Please try again later.")
                    return None
        
        return None

# Usage
auth = RobustAuthenticator(client_id="your_client_id")
token = auth.authenticate("user@example.com")

if token:
    print(f"\n✓ Successfully authenticated!")
    print(f"Token: {token[:50]}...")
else:
    print("\n✗ Authentication failed")
```

---

## Example 6: Multi-User Authentication

Handle authentication for multiple users simultaneously.

```python
from AuthSec_SDK import CIBAClient
import threading
from queue import Queue

class MultiUserAuth:
    def __init__(self, client_id):
        self.ciba = CIBAClient(client_id=client_id)
        self.results = Queue()
    
    def authenticate_user(self, email):
        """Authenticate a single user (runs in thread)"""
        try:
            result = self.ciba.initiate_app_approval(email)
            approval = self.ciba.poll_for_approval(
                email, 
                result["auth_req_id"], 
                timeout=120
            )
            
            self.results.put({
                "email": email,
                "status": approval["status"],
                "token": approval.get("token")
            })
        
        except Exception as e:
            self.results.put({
                "email": email,
                "status": "error",
                "error": str(e)
            })
    
    def authenticate_multiple(self, emails):
        """Authenticate multiple users concurrently"""
        threads = []
        
        # Start authentication for each user
        for email in emails:
            thread = threading.Thread(
                target=self.authenticate_user, 
                args=(email,)
            )
            thread.start()
            threads.append(thread)
            print(f"Started authentication for {email}")
        
        # Wait for all to complete
        for thread in threads:
            thread.join()
        
        # Collect results
        results = []
        while not self.results.empty():
            results.append(self.results.get())
        
        return results

# Usage
auth = MultiUserAuth(client_id="your_client_id")

users = [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
]

print("Authenticating multiple users...")
results = auth.authenticate_multiple(users)

for result in results:
    if result["status"] == "approved":
        print(f"✓ {result['email']}: Authenticated")
    else:
        print(f"✗ {result['email']}: {result['status']}")
```

---

## Next Steps

- [Error Handling](./error-handling) - Learn robust error handling
- [API Reference](./api-reference) - Complete method documentation
- [FAQ](./faq) - Common questions and answers
