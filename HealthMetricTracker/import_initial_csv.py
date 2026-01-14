import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, init_db
from models import DailyMetrics

def import_csv(csv_path: str = "attached_assets/amin_daily_energy_merged_steps_from_sheet_1763460862421.csv"):
    init_db()
    
    print(f"Reading CSV file: {csv_path}")
    df = pd.read_csv(csv_path)
    
    print(f"Total rows in CSV: {len(df)}")
    
    df['DATE'] = pd.to_datetime(df['DATE'])
    df_filtered = df[df['DATE'] >= '2025-09-01'].copy()
    
    print(f"Rows from 2025-09-01 onwards: {len(df_filtered)}")
    
    db = SessionLocal()
    
    try:
        imported_count = 0
        updated_count = 0
        
        for _, row in df_filtered.iterrows():
            date_value = row['DATE'].date()
            
            existing = db.query(DailyMetrics).filter(DailyMetrics.date == date_value).first()
            
            def safe_float(val):
                if pd.isna(val) or val == '':
                    return None
                try:
                    return float(val)
                except (ValueError, TypeError):
                    return None
            
            def safe_int(val):
                if pd.isna(val) or val == '':
                    return None
                try:
                    return int(float(val))
                except (ValueError, TypeError):
                    return None
            
            if existing:
                existing.steps = safe_int(row['steps'])
                existing.weight_kg = safe_float(row['weight_kg'])
                existing.calories_burned_total = safe_float(row['total_burned_kcal'])
                existing.calories_burned_active = safe_float(row['active_kcal'])
                existing.calories_burned_basal = safe_float(row['basal_kcal'])
                existing.calories_eaten = safe_float(row['calories_eaten'])
                if existing.daily_calorie_target is None:
                    existing.daily_calorie_target = 3000.0
                existing.updated_at = datetime.now()
                updated_count += 1
            else:
                new_metric = DailyMetrics(
                    date=date_value,
                    steps=safe_int(row['steps']),
                    weight_kg=safe_float(row['weight_kg']),
                    calories_burned_total=safe_float(row['total_burned_kcal']),
                    calories_burned_active=safe_float(row['active_kcal']),
                    calories_burned_basal=safe_float(row['basal_kcal']),
                    calories_eaten=safe_float(row['calories_eaten']),
                    daily_calorie_target=3000.0
                )
                db.add(new_metric)
                imported_count += 1
        
        db.commit()
        print(f"\nImport complete!")
        print(f"New records created: {imported_count}")
        print(f"Existing records updated: {updated_count}")
        print(f"Total records processed: {imported_count + updated_count}")
        
    except Exception as e:
        db.rollback()
        print(f"Error during import: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import_csv()
