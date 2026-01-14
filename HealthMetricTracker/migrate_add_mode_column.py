import sqlite3
from models import WeightMode

# Connect to the database
conn = sqlite3.connect('health.db')
cursor = conn.cursor()

# Check if mode column exists
cursor.execute("PRAGMA table_info(daily_metrics)")
columns = [column[1] for column in cursor.fetchall()]

if 'mode' not in columns:
    print("Adding mode column to daily_metrics table...")
    
    # Add the mode column (nullable)
    cursor.execute("ALTER TABLE daily_metrics ADD COLUMN mode TEXT")
    
    print("Mode column added successfully!")
    
    # Check if user_settings table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_settings'")
    if not cursor.fetchone():
        print("Creating user_settings table...")
        cursor.execute("""
            CREATE TABLE user_settings (
                id INTEGER PRIMARY KEY,
                maintenance_calories REAL NOT NULL,
                current_mode TEXT NOT NULL,
                gentle_deficit REAL NOT NULL,
                standard_deficit REAL NOT NULL,
                aggressive_deficit REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Insert default settings
        cursor.execute("""
            INSERT INTO user_settings 
            (id, maintenance_calories, current_mode, gentle_deficit, standard_deficit, aggressive_deficit)
            VALUES (1, 3000.0, ?, 250.0, 500.0, 750.0)
        """, (WeightMode.MAINTENANCE.value,))
        
        print("user_settings table created with default values!")
    
    conn.commit()
else:
    print("Mode column already exists!")

conn.close()
print("Migration complete!")
