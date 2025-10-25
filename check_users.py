import sqlite3

conn = sqlite3.connect('surgical_risk.db')
cursor = conn.cursor()

# Check all users
cursor.execute('SELECT email, user_type, full_name FROM users')
users = cursor.fetchall()

print("\n=== ALL USERS IN DATABASE ===")
for user in users:
    print(f"Email: {user[0]}, Type: {user[1]}, Name: {user[2]}")

conn.close()
