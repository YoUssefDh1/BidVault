import sqlite3

conn = sqlite3.connect("bidding.db")
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS favourites (
        user_id    INTEGER NOT NULL REFERENCES users(id),
        auction_id INTEGER NOT NULL REFERENCES auctions(id),
        PRIMARY KEY (user_id, auction_id)
    )
""")
conn.commit()
conn.close()
print("✅ favourites table created")