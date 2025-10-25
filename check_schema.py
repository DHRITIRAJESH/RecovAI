import sqlite3

conn = sqlite3.connect('surgical_risk.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()

print("=" * 60)
print("DATABASE TABLES:")
print("=" * 60)
for table in tables:
    table_name = table[0]
    print(f"\n📋 Table: {table_name}")
    print("-" * 60)
    
    # Get schema
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    
    for col in columns:
        print(f"  {col[1]} ({col[2]}) - {'NOT NULL' if col[3] else 'NULL'} - {'PK' if col[5] else ''}")
    
    # Get row count
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cursor.fetchone()[0]
    print(f"\n  Total rows: {count}")
    
    # Show first few rows
    if count > 0:
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
        rows = cursor.fetchall()
        print(f"  Sample data: {len(rows)} rows")

conn.close()
