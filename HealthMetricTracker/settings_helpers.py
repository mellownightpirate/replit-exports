from sqlalchemy.orm import Session
from models import UserSettings, WeightMode
from datetime import datetime

def get_or_create_settings(db: Session) -> UserSettings:
    """Get the single user settings record, or create it with defaults if it doesn't exist."""
    settings = db.query(UserSettings).filter(UserSettings.id == 1).first()
    
    if not settings:
        settings = UserSettings(
            id=1,
            maintenance_calories=3000.0,
            current_mode=WeightMode.MAINTENANCE,
            deficit_gentle=250.0,
            deficit_standard=500.0,
            deficit_aggressive=750.0
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings

def update_settings(db: Session, maintenance_calories: float = None, current_mode: WeightMode = None,
                   deficit_gentle: float = None, deficit_standard: float = None, 
                   deficit_aggressive: float = None,
                   maintenance_window_days: int = None, loss_gentle_percent: float = None,
                   loss_standard_percent: float = None, loss_aggressive_percent: float = None) -> UserSettings:
    """Update user settings."""
    settings = get_or_create_settings(db)
    
    if maintenance_calories is not None:
        settings.maintenance_calories = maintenance_calories
    if current_mode is not None:
        settings.current_mode = current_mode
    if deficit_gentle is not None:
        settings.deficit_gentle = deficit_gentle
    if deficit_standard is not None:
        settings.deficit_standard = deficit_standard
    if deficit_aggressive is not None:
        settings.deficit_aggressive = deficit_aggressive
    if maintenance_window_days is not None:
        # Enforce minimum window of 14 days for statistical reliability
        settings.maintenance_window_days = max(14, maintenance_window_days)
    if loss_gentle_percent is not None:
        settings.loss_gentle_percent = loss_gentle_percent
    if loss_standard_percent is not None:
        settings.loss_standard_percent = loss_standard_percent
    if loss_aggressive_percent is not None:
        settings.loss_aggressive_percent = loss_aggressive_percent
    
    settings.updated_at = datetime.now()
    db.commit()
    db.refresh(settings)
    
    return settings

def compute_target_from_settings(settings: UserSettings, mode: WeightMode = None) -> float:
    """Compute daily calorie target based on settings and mode (fallback when no burn data).
    
    Args:
        settings: UserSettings instance
        mode: WeightMode to use (if None, uses settings.current_mode)
    
    Returns:
        Daily calorie target (clamped to minimum 1200 kcal)
    """
    if mode is None:
        mode = settings.current_mode
    
    maintenance = settings.maintenance_calories
    
    if mode == WeightMode.MAINTENANCE:
        target = maintenance
    elif mode == WeightMode.LOSS_GENTLE:
        target = maintenance - settings.deficit_gentle
    elif mode == WeightMode.LOSS_STANDARD:
        target = maintenance - settings.deficit_standard
    elif mode == WeightMode.LOSS_AGGRESSIVE:
        target = maintenance - settings.deficit_aggressive
    else:
        target = maintenance
    
    # Clamp to minimum 1200 kcal
    return max(target, 1200.0)

def compute_dynamic_target(calories_burned: float, mode: WeightMode, settings: UserSettings) -> float:
    """Compute dynamic daily calorie target based on actual calories burned.
    
    Args:
        calories_burned: Actual calories burned for the day
        mode: WeightMode for the day
        settings: UserSettings instance
    
    Returns:
        Dynamic calorie target (clamped to minimum 1200 kcal)
    """
    if mode == WeightMode.MAINTENANCE:
        target = calories_burned
    elif mode == WeightMode.LOSS_GENTLE:
        target = calories_burned - settings.deficit_gentle
    elif mode == WeightMode.LOSS_STANDARD:
        target = calories_burned - settings.deficit_standard
    elif mode == WeightMode.LOSS_AGGRESSIVE:
        target = calories_burned - settings.deficit_aggressive
    else:
        target = calories_burned
    
    # Clamp to minimum 1200 kcal
    return max(target, 1200.0)

def get_mode_display_name(mode: WeightMode) -> str:
    """Get a user-friendly display name for a weight mode."""
    mode_names = {
        WeightMode.MAINTENANCE: "Maintenance",
        WeightMode.LOSS_GENTLE: "Gentle Weight Loss",
        WeightMode.LOSS_STANDARD: "Standard Weight Loss",
        WeightMode.LOSS_AGGRESSIVE: "Aggressive Weight Loss"
    }
    return mode_names.get(mode, str(mode))
