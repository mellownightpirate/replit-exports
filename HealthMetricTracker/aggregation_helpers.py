from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import DailyMetrics
from typing import Dict, Any

def get_aggregated_stats(db: Session, selected_date: date) -> Dict[str, Any]:
    """
    Get aggregated statistics for weekly and monthly periods.
    
    Returns:
        Dictionary with burn and deficit statistics for 7 and 30 day periods
    """
    # Calculate date ranges
    date_7_days_ago = selected_date - timedelta(days=6)  # Include selected_date
    date_30_days_ago = selected_date - timedelta(days=29)  # Include selected_date
    
    # Get 7-day data
    last_7_days = db.query(DailyMetrics).filter(
        DailyMetrics.date >= date_7_days_ago,
        DailyMetrics.date <= selected_date
    ).all()
    
    # Get 30-day data
    last_30_days = db.query(DailyMetrics).filter(
        DailyMetrics.date >= date_30_days_ago,
        DailyMetrics.date <= selected_date
    ).all()
    
    # Calculate 7-day stats (include all days in averages, treating missing as 0)
    burn_7 = sum(m.calories_burned_total or 0 for m in last_7_days)
    eaten_7 = sum(m.calories_eaten or 0 for m in last_7_days)
    # For deficits, only include days with burn data to avoid skewing
    deficits_7 = [(m.calories_eaten or 0) - (m.calories_burned_total or 0) for m in last_7_days if m.calories_burned_total is not None]
    weights_7 = [m.weight_kg for m in last_7_days if m.weight_kg is not None]
    protein_7 = [m.protein_total_g for m in last_7_days if m.protein_total_g is not None]
    
    # Average over 7 days for burn/eaten, but only over days with data for weight/protein/deficit
    avg_burn_7 = burn_7 / 7.0  # Always divide by 7 days
    avg_eaten_7 = eaten_7 / 7.0  # Always divide by 7 days
    avg_deficit_7 = sum(deficits_7) / len(deficits_7) if deficits_7 else 0
    avg_weight_7 = sum(weights_7) / len(weights_7) if weights_7 else None
    avg_protein_7 = sum(protein_7) / len(protein_7) if protein_7 else None
    
    # Calculate 30-day stats (include all days in averages, treating missing as 0)
    burn_30 = sum(m.calories_burned_total or 0 for m in last_30_days)
    eaten_30 = sum(m.calories_eaten or 0 for m in last_30_days)
    # For deficits, only include days with burn data to avoid skewing
    deficits_30 = [(m.calories_eaten or 0) - (m.calories_burned_total or 0) for m in last_30_days if m.calories_burned_total is not None]
    weights_30 = [m.weight_kg for m in last_30_days if m.weight_kg is not None]
    protein_30 = [m.protein_total_g for m in last_30_days if m.protein_total_g is not None]
    
    # Average over 30 days for burn/eaten, but only over days with data for weight/protein/deficit
    avg_burn_30 = burn_30 / 30.0  # Always divide by 30 days
    avg_eaten_30 = eaten_30 / 30.0  # Always divide by 30 days
    avg_deficit_30 = sum(deficits_30) / len(deficits_30) if deficits_30 else 0
    avg_weight_30 = sum(weights_30) / len(weights_30) if weights_30 else None
    avg_protein_30 = sum(protein_30) / len(protein_30) if protein_30 else None
    
    return {
        # 7-day totals
        'burn_last_7_days': burn_7,
        'eaten_last_7_days': eaten_7,
        
        # 7-day averages
        'avg_calories_burned_last_7_days': avg_burn_7,
        'avg_calories_eaten_last_7_days': avg_eaten_7,
        'avg_daily_deficit_last_7_days': avg_deficit_7,
        'avg_weight_last_7_days': avg_weight_7,
        'avg_protein_last_7_days': avg_protein_7,
        
        # 30-day totals
        'burn_last_30_days': burn_30,
        'eaten_last_30_days': eaten_30,
        
        # 30-day averages
        'avg_calories_burned_last_30_days': avg_burn_30,
        'avg_calories_eaten_last_30_days': avg_eaten_30,
        'avg_daily_deficit_last_30_days': avg_deficit_30,
        'avg_weight_last_30_days': avg_weight_30,
        'avg_protein_last_30_days': avg_protein_30,
    }

def get_recent_weight(db: Session, before_date: date) -> float:
    """Get the most recent weight before a given date."""
    metric = db.query(DailyMetrics).filter(
        DailyMetrics.date < before_date,
        DailyMetrics.weight_kg.isnot(None)
    ).order_by(DailyMetrics.date.desc()).first()
    
    return metric.weight_kg if metric else None
