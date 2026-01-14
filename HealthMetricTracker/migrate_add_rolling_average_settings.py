"""
Migration script to add rolling average and percentage-based deficit fields to user_settings table.
Run this once to update the database schema.
"""
from sqlalchemy import create_engine, text
from database import SQLALCHEMY_DATABASE_URL

def migrate():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if columns already exist
        result = conn.execute(text("PRAGMA table_info(user_settings)"))
        columns = [row[1] for row in result]
        
        migrations = []
        
        if 'maintenance_window_days' not in columns:
            migrations.append("ALTER TABLE user_settings ADD COLUMN maintenance_window_days INTEGER NOT NULL DEFAULT 21")
        
        if 'loss_gentle_percent' not in columns:
            migrations.append("ALTER TABLE user_settings ADD COLUMN loss_gentle_percent REAL NOT NULL DEFAULT 0.10")
        
        if 'loss_standard_percent' not in columns:
            migrations.append("ALTER TABLE user_settings ADD COLUMN loss_standard_percent REAL NOT NULL DEFAULT 0.15")
        
        if 'loss_aggressive_percent' not in columns:
            migrations.append("ALTER TABLE user_settings ADD COLUMN loss_aggressive_percent REAL NOT NULL DEFAULT 0.20")
        
        for migration in migrations:
            print(f"Running: {migration}")
            conn.execute(text(migration))
            conn.commit()
        
        if migrations:
            print(f"✅ Successfully added {len(migrations)} new columns to user_settings table")
        else:
            print("✅ All columns already exist, no migration needed")

if __name__ == "__main__":
    migrate()
