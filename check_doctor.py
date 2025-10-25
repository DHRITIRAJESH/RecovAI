import sqlite3

conn = sqlite3.connect('surgical_risk.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Check doctor
cursor.execute('SELECT * FROM users WHERE user_type="doctor"')
doctor = cursor.fetchone()

if doctor:
    print("=" * 60)
    print("DOCTOR RECORD FOUND:")
    print("=" * 60)
    for key in doctor.keys():
        value = doctor[key]
        if key == 'password_hash':
            value = value[:50] + '...'
        print(f"{key}: {value}")
else:
    print("❌ NO DOCTOR FOUND!")
    
# Show all users
print("\n" + "=" * 60)
print("ALL USERS:")
print("=" * 60)
cursor.execute('SELECT user_id, email, user_type, full_name FROM users')
for user in cursor.fetchall():
    print(f"ID: {user['user_id']}, Email: {user['email']}, Type: {user['user_type']}, Name: {user['full_name']}")

conn.close()
