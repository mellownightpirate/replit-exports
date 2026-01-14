from datetime import date, datetime, time
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import CalorieEntry, DailyMetrics, WeightMode
from settings_helpers import get_or_create_settings, compute_target_from_settings, get_mode_display_name
from aggregation_helpers import get_aggregated_stats, get_recent_weight
from rolling_average_helpers import (
    get_rolling_burn_average,
    compute_dynamic_target_from_rolling_avg,
    recalculate_target_for_date,
    get_deficit_percent_for_mode
)

def get_calorie_entries(db: Session, selected_date: date):
    """Get all calorie entries for a specific date, ordered by time."""
    return db.query(CalorieEntry).filter(
        CalorieEntry.date == selected_date
    ).order_by(CalorieEntry.time).all()

def add_calorie_entry(db: Session, entry_date: date, entry_time: time, description: str, calories: float, 
                      protein_g: float = None, place: str = None, star_flag: str = None, 
                      vl_flag: str = None, planned_slot: str = None, context_comments: str = None):
    """Add a new calorie entry and update daily metrics."""
    daily_metric = db.query(DailyMetrics).filter(DailyMetrics.date == entry_date).first()
    
    if not daily_metric:
        settings = get_or_create_settings(db)
        daily_metric = DailyMetrics(
            date=entry_date,
            mode=settings.current_mode,
            daily_calorie_target=compute_target_from_settings(settings)
        )
        db.add(daily_metric)
        db.commit()
        db.refresh(daily_metric)
    
    new_entry = CalorieEntry(
        date=entry_date,
        time=entry_time,
        description=description,
        calories=calories,
        protein_g=protein_g,
        place=place,
        star_flag=star_flag,
        vl_flag=vl_flag,
        planned_slot=planned_slot,
        context_comments=context_comments,
        daily_metric_date=entry_date
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    recompute_daily_totals(db, entry_date)
    
    return new_entry

def delete_calorie_entry(db: Session, entry_id: int):
    """Delete a calorie entry and update daily metrics."""
    entry = db.query(CalorieEntry).filter(CalorieEntry.id == entry_id).first()
    if entry:
        entry_date = entry.date
        db.delete(entry)
        db.commit()
        
        recompute_daily_totals(db, entry_date)
        return True
    return False

def recompute_daily_totals(db: Session, selected_date: date):
    """Recompute calories_eaten, protein_total_g, dynamic target, and auto protein target."""
    calories_total = db.query(func.sum(CalorieEntry.calories)).filter(
        CalorieEntry.date == selected_date
    ).scalar()
    
    protein_total = db.query(func.sum(CalorieEntry.protein_g)).filter(
        CalorieEntry.date == selected_date
    ).scalar()
    
    daily_metric = db.query(DailyMetrics).filter(
        DailyMetrics.date == selected_date
    ).first()
    
    settings = get_or_create_settings(db)
    
    if daily_metric:
        # Store explicit 0 when no entries, not None (for accurate aggregation)
        daily_metric.calories_eaten = calories_total if calories_total else 0.0
        daily_metric.protein_total_g = protein_total if protein_total else 0.0
        
        # Recalculate dynamic target using rolling average
        recalculate_target_for_date(db, selected_date)
        
        # Auto-calculate protein target if not manually set (treat 0 as needing target)
        if daily_metric.weight_kg is not None and daily_metric.protein_target_g in (None, 0):
            daily_metric.protein_target_g = round(daily_metric.weight_kg * 2.0)
        elif daily_metric.weight_kg is None and daily_metric.protein_target_g in (None, 0):
            # Try to get recent weight
            recent_weight = get_recent_weight(db, selected_date)
            if recent_weight:
                daily_metric.protein_target_g = round(recent_weight * 2.0)
        
        daily_metric.updated_at = datetime.now()
    elif calories_total or protein_total:
        daily_metric = DailyMetrics(
            date=selected_date,
            calories_eaten=calories_total,
            protein_total_g=protein_total,
            mode=settings.current_mode,
            daily_calorie_target=compute_target_from_settings(settings)
        )
        db.add(daily_metric)
    
    db.commit()
    
    db.execute(
        CalorieEntry.__table__.update().where(
            CalorieEntry.date == selected_date
        ).values(daily_metric_date=selected_date)
    )
    db.commit()

# Keep backward compatibility alias
def recompute_daily_calories(db: Session, selected_date: date):
    """Backward compatibility wrapper for recompute_daily_totals."""
    recompute_daily_totals(db, selected_date)

def upsert_metric(db: Session, data: dict):
    """Insert or update daily metrics with dynamic target calculation and protein auto-calc."""
    existing = db.query(DailyMetrics).filter(DailyMetrics.date == data['date']).first()
    settings = get_or_create_settings(db)
    
    if existing:
        # Store original values to detect changes
        mode_before = existing.mode or settings.current_mode
        burn_before = existing.calories_burned_total
        weight_before = existing.weight_kg
        protein_target_before = existing.protein_target_g
        
        # Update fields from data
        for key, value in data.items():
            if key != 'date':
                setattr(existing, key, value)
        
        # Get new values after update
        mode_after = existing.mode or settings.current_mode
        burn_after = existing.calories_burned_total
        weight_after = existing.weight_kg
        protein_target_after = existing.protein_target_g
        
        # Recalculate dynamic target using rolling average if burn or mode changed
        if burn_after != burn_before or mode_after != mode_before:
            recalculate_target_for_date(db, data['date'])
        
        # Auto-calculate protein target if:
        # 1. Weight changed and target wasn't manually overridden, OR
        # 2. Weight exists but target is 0/None (legacy data backfill)
        if weight_after is not None:
            # Check if target should be auto-calculated
            if weight_after != weight_before and protein_target_after == protein_target_before:
                # Weight changed, no manual override
                existing.protein_target_g = round(weight_after * 2.0)
            elif protein_target_after in (None, 0):
                # Legacy data: has weight but no target
                existing.protein_target_g = round(weight_after * 2.0)
        elif weight_after is None and existing.protein_target_g in (None, 0):
            # Try to get recent weight
            recent_weight = get_recent_weight(db, data['date'])
            if recent_weight:
                existing.protein_target_g = round(recent_weight * 2.0)
        
        existing.updated_at = datetime.now()
        db.commit()
        return existing
    else:
        # New record
        if 'mode' not in data or data['mode'] is None:
            data['mode'] = settings.current_mode
        
        mode = data.get('mode') or settings.current_mode
        burn = data.get('calories_burned_total')
        weight = data.get('weight_kg')
        
        # Set initial target - will be recalculated after insert
        if 'daily_calorie_target' not in data or data['daily_calorie_target'] is None:
            data['daily_calorie_target'] = compute_target_from_settings(settings, mode)
        
        # Auto-calculate protein target (including 0 as needing a target)
        if weight is not None and ('protein_target_g' not in data or data.get('protein_target_g') in (None, 0)):
            data['protein_target_g'] = round(weight * 2.0)
        elif weight is None and ('protein_target_g' not in data or data.get('protein_target_g') in (None, 0)):
            recent_weight = get_recent_weight(db, data['date'])
            if recent_weight:
                data['protein_target_g'] = round(recent_weight * 2.0)
        
        new_metric = DailyMetrics(**data)
        db.add(new_metric)
        db.commit()
        db.refresh(new_metric)
        
        # Recalculate target using rolling average after creating the record
        recalculate_target_for_date(db, data['date'])
        db.refresh(new_metric)
        
        return new_metric

def get_daily_summary(db: Session, selected_date: date, default_target: float = 3000.0):
    """Generate a summary of daily status with aggregated statistics."""
    daily_metric = db.query(DailyMetrics).filter(
        DailyMetrics.date == selected_date
    ).first()
    
    settings = get_or_create_settings(db)
    aggregated = get_aggregated_stats(db, selected_date)
    
    if not daily_metric:
        computed_target = compute_target_from_settings(settings)
        result = {
            'date': selected_date,
            'calories_eaten': 0,
            'calories_burned_total': 0,
            'calorie_balance': 0,
            'daily_calorie_target': computed_target,
            'percentage_of_target': 0,
            'mode': settings.current_mode,
            'protein_total_g': 0,
            'protein_target_g': None,
            'protein_percentage': 0,
            'summary_text': "No data for today yet."
        }
        result.update(aggregated)
        return result
    
    calories_eaten = daily_metric.calories_eaten or 0
    calories_burned = daily_metric.calories_burned_total or 0
    target = daily_metric.daily_calorie_target or default_target
    calorie_balance = daily_metric.calorie_balance or (calories_eaten - calories_burned)
    mode = daily_metric.mode or settings.current_mode
    weight = daily_metric.weight_kg
    
    protein_total = daily_metric.protein_total_g or 0
    protein_target = daily_metric.protein_target_g
    protein_percentage = (protein_total / protein_target * 100) if protein_target and protein_target > 0 else 0
    
    percentage_of_target = (calories_eaten / target * 100) if target > 0 else 0
    remaining_to_target = target - calories_eaten
    
    # Get rolling burn average and deficit percent for summary
    rolling_burn_avg = get_rolling_burn_average(db, selected_date, settings.maintenance_window_days)
    deficit_percent = get_deficit_percent_for_mode(mode, settings)
    
    # Build plain English summary explaining rolling average and target
    mode_name = get_mode_display_name(mode)
    summary_text = ""
    
    if mode == WeightMode.MAINTENANCE:
        summary_text = f"Based on an average burn of {rolling_burn_avg:,.0f} kcal/day over the last {settings.maintenance_window_days} days, your maintenance is ~{rolling_burn_avg:,.0f} kcal. In {mode_name} mode, today's target is {target:,.0f} kcal. "
    else:
        summary_text = f"Based on an average burn of {rolling_burn_avg:,.0f} kcal/day over the last {settings.maintenance_window_days} days, your maintenance is ~{rolling_burn_avg:,.0f} kcal. In {mode_name} mode ({deficit_percent*100:.0f}% deficit), today's target is {target:,.0f} kcal. "
    
    # Add eating status
    if calories_eaten > 0:
        summary_text += f"You've eaten {calories_eaten:,.0f} kcal ({percentage_of_target:.0f}% of target)."
    else:
        summary_text += "No calories logged yet."
    
    result = {
        'date': selected_date,
        'calories_eaten': calories_eaten,
        'calories_burned_total': calories_burned,
        'burn_today': calories_burned,
        'calorie_balance': calorie_balance,
        'daily_calorie_target': target,
        'percentage_of_target': percentage_of_target,
        'remaining_to_target': remaining_to_target,
        'mode': mode,
        'weight_kg': weight,
        'protein_total_g': protein_total,
        'protein_target_g': protein_target,
        'protein_percentage': protein_percentage,
        'rolling_burn_avg': rolling_burn_avg,
        'deficit_percent': deficit_percent,
        'maintenance_window_days': settings.maintenance_window_days,
        'summary_text': summary_text
    }
    
    # Merge aggregated stats
    result.update(aggregated)
    
    return result


def clear_day_data(db: Session, selected_date: date) -> dict:
    """
    Delete all metrics and calorie entries for a specific date.
    
    Returns:
        Dictionary with counts of deleted rows
    """
    # Delete calorie entries first
    entries_deleted = db.query(CalorieEntry).filter(CalorieEntry.date == selected_date).delete()
    
    # Delete daily metrics
    metrics_deleted = db.query(DailyMetrics).filter(DailyMetrics.date == selected_date).delete()
    
    db.commit()
    
    return {
        'date': selected_date.isoformat(),
        'calorie_entries_deleted': entries_deleted,
        'daily_metrics_deleted': metrics_deleted
    }
