"""
Helper functions for rolling average burn calculations and dynamic target computation.
"""
from datetime import date, timedelta
from sqlalchemy.orm import Session
from models import DailyMetrics, UserSettings, WeightMode
from settings_helpers import get_or_create_settings


def get_rolling_burn_average(db: Session, target_date: date, window_days: int = 21, min_days: int = 7) -> float:
    """
    Calculate the rolling average of calories_burned_total over the specified window.
    
    Args:
        db: Database session
        target_date: The date to calculate the average for
        window_days: Number of days to look back (default 21)
        min_days: Minimum number of valid days required (default 7)
    
    Returns:
        Rolling average burn, or falls back to maintenance_calories if insufficient data
    """
    # Validate window_days >= min_days
    if window_days < min_days:
        window_days = max(min_days, 14)  # Enforce minimum 14 days for statistical reliability
    
    start_date = target_date - timedelta(days=window_days - 1)
    
    # Query all metrics in the window
    metrics = db.query(DailyMetrics).filter(
        DailyMetrics.date >= start_date,
        DailyMetrics.date <= target_date,
        DailyMetrics.calories_burned_total.isnot(None)
    ).all()
    
    if len(metrics) < min_days:
        # Insufficient data, fall back to settings
        settings = get_or_create_settings(db)
        return settings.maintenance_calories
    
    # Calculate average
    total_burn = sum(m.calories_burned_total for m in metrics)
    return total_burn / len(metrics)


def compute_dynamic_target_from_rolling_avg(
    rolling_burn_avg: float,
    mode: WeightMode,
    settings: UserSettings
) -> float:
    """
    Compute dynamic calorie target based on rolling burn average and mode.
    
    Args:
        rolling_burn_avg: Average calories burned over the rolling window
        mode: Weight goal mode
        settings: User settings with deficit percentages
    
    Returns:
        Daily calorie target, clamped to minimum 1500 kcal
    """
    base = rolling_burn_avg
    
    if mode == WeightMode.MAINTENANCE:
        target = base
    elif mode == WeightMode.LOSS_GENTLE:
        target = base * (1.0 - settings.loss_gentle_percent)
    elif mode == WeightMode.LOSS_STANDARD:
        target = base * (1.0 - settings.loss_standard_percent)
    elif mode == WeightMode.LOSS_AGGRESSIVE:
        target = base * (1.0 - settings.loss_aggressive_percent)
    else:
        target = base
    
    # Clamp to minimum 1500 kcal for safety
    return max(target, 1500.0)


def recalculate_target_for_date(db: Session, target_date: date) -> None:
    """
    Recalculate and update the daily_calorie_target for a specific date.
    Uses rolling average burn and percentage-based deficits.
    
    Args:
        db: Database session
        target_date: The date to recalculate target for
    """
    settings = get_or_create_settings(db)
    daily_metric = db.query(DailyMetrics).filter(DailyMetrics.date == target_date).first()
    
    if not daily_metric:
        return  # No metric exists for this date
    
    mode = daily_metric.mode or settings.current_mode
    rolling_burn_avg = get_rolling_burn_average(db, target_date, settings.maintenance_window_days)
    new_target = compute_dynamic_target_from_rolling_avg(rolling_burn_avg, mode, settings)
    
    daily_metric.daily_calorie_target = new_target
    db.commit()


def recalculate_all_targets(db: Session) -> int:
    """
    Recalculate daily_calorie_target for all existing daily metrics.
    Useful when settings change (maintenance_window_days or deficit percentages).
    
    Returns:
        Number of records updated
    """
    metrics = db.query(DailyMetrics).order_by(DailyMetrics.date).all()
    count = 0
    
    for metric in metrics:
        recalculate_target_for_date(db, metric.date)
        count += 1
    
    return count


def get_deficit_percent_for_mode(mode: WeightMode, settings: UserSettings) -> float:
    """
    Get the deficit percentage for a given mode.
    
    Returns:
        Deficit percentage (e.g., 0.15 for 15%)
    """
    if mode == WeightMode.LOSS_GENTLE:
        return settings.loss_gentle_percent
    elif mode == WeightMode.LOSS_STANDARD:
        return settings.loss_standard_percent
    elif mode == WeightMode.LOSS_AGGRESSIVE:
        return settings.loss_aggressive_percent
    else:
        return 0.0
