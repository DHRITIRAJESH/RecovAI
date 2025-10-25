import sqlite3
from werkzeug.security import check_password_hash

conn = sqlite3.connect('surgical_risk.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

email = 'dr.smith@hospital.com'
password = 'doctor123'

cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
user = cursor.fetchone()

if user:
    print("=" * 60)
    print("PASSWORD VERIFICATION TEST:")
    print("=" * 60)
    print(f"Email: {user['email']}")
    print(f"User Type: {user['user_type']}")
    print(f"Password Hash: {user['password_hash'][:60]}...")
    print(f"\nTesting password: '{password}'")
    
    is_valid = check_password_hash(user['password_hash'], password)
    print(f"✅ Password Valid: {is_valid}")
    
    if is_valid:
        print("\n✅ LOGIN SHOULD WORK!")
        print("\nUser data that would be returned:")
        user_dict = dict(user)
        for key, value in user_dict.items():
            if key == 'password_hash':
                value = value[:50] + '...'
            print(f"  {key}: {value}")
    else:
        print("\n❌ LOGIN WILL FAIL - Password doesn't match!")
else:
    print(f"❌ NO USER FOUND with email: {email}")

conn.close()
