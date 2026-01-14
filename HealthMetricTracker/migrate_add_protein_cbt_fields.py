import sqlite3

# Connect to the database
conn = sqlite3.connect('health.db')
cursor = conn.cursor()

print("Adding protein and CBT-E fields to database...")

# Check and add columns to daily_metrics
cursor.execute("PRAGMA table_info(daily_metrics)")
daily_columns = [column[1] for column in cursor.fetchall()]

if 'protein_total_g' not in daily_columns:
    print("Adding protein_total_g to daily_metrics...")
    cursor.execute("ALTER TABLE daily_metrics ADD COLUMN protein_total_g REAL")
else:
    print("protein_total_g already exists in daily_metrics")

if 'protein_target_g' not in daily_columns:
    print("Adding protein_target_g to daily_metrics...")
    cursor.execute("ALTER TABLE daily_metrics ADD COLUMN protein_target_g REAL")
else:
    print("protein_target_g already exists in daily_metrics")

# Check and add columns to calorie_entries
cursor.execute("PRAGMA table_info(calorie_entries)")
entry_columns = [column[1] for column in cursor.fetchall()]

columns_to_add = [
    ('protein_g', 'REAL'),
    ('place', 'TEXT'),
    ('star_flag', 'TEXT'),
    ('vl_flag', 'TEXT'),
    ('planned_slot', 'TEXT'),
    ('context_comments', 'TEXT')
]

for col_name, col_type in columns_to_add:
    if col_name not in entry_columns:
        print(f"Adding {col_name} to calorie_entries...")
        cursor.execute(f"ALTER TABLE calorie_entries ADD COLUMN {col_name} {col_type}")
    else:
        print(f"{col_name} already exists in calorie_entries")

conn.commit()
conn.close()

print("Migration complete!")
