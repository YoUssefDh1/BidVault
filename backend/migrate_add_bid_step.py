"""
Run this once to add the bid_step column to the existing products table.
    python migrate_add_bid_step.py
"""
import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), "bidding.db")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(products)")
columns = [row[1] for row in cursor.fetchall()]

if "bid_step" not in columns:
    cursor.execute("ALTER TABLE products ADD COLUMN bid_step FLOAT;")
    conn.commit()
    print("✓ bid_step column added to products table.")
else:
    print("— bid_step column already exists, nothing to do.")

conn.close()
