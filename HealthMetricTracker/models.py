from sqlalchemy import Column, Integer, Float, Date, DateTime, Time, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class WeightMode(str, enum.Enum):
    MAINTENANCE = "maintenance"
    LOSS_GENTLE = "loss_gentle"
    LOSS_STANDARD = "loss_standard"
    LOSS_AGGRESSIVE = "loss_aggressive"

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, default=1)
    maintenance_calories = Column(Float, nullable=False, default=3000.0)
    current_mode = Column(Enum(WeightMode), nullable=False, default=WeightMode.MAINTENANCE)
    # Legacy fixed deficit fields (kept for backward compatibility)
    deficit_gentle = Column(Float, nullable=False, default=250.0)
    deficit_standard = Column(Float, nullable=False, default=500.0)
    deficit_aggressive = Column(Float, nullable=False, default=750.0)
    # New rolling average and percentage-based deficit fields
    maintenance_window_days = Column(Integer, nullable=False, default=21)
    loss_gentle_percent = Column(Float, nullable=False, default=0.10)
    loss_standard_percent = Column(Float, nullable=False, default=0.15)
    loss_aggressive_percent = Column(Float, nullable=False, default=0.20)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

class DailyMetrics(Base):
    __tablename__ = "daily_metrics"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False, index=True)
    steps = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    calories_burned_total = Column(Float, nullable=True)
    calories_burned_active = Column(Float, nullable=True)
    calories_burned_basal = Column(Float, nullable=True)
    calories_eaten = Column(Float, nullable=True)
    daily_calorie_target = Column(Float, nullable=True)
    mode = Column(Enum(WeightMode), nullable=True)
    protein_total_g = Column(Float, nullable=True)
    protein_target_g = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    calorie_entries = relationship("CalorieEntry", back_populates="daily_metric", cascade="all, delete-orphan")

    @property
    def calorie_balance(self):
        if self.calories_eaten is not None and self.calories_burned_total is not None:
            return self.calories_eaten - self.calories_burned_total
        return None


class CalorieEntry(Base):
    __tablename__ = "calorie_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    time = Column(Time, nullable=True)
    description = Column(String, nullable=True)
    calories = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=True)
    place = Column(String, nullable=True)
    star_flag = Column(String, nullable=True)
    vl_flag = Column(String, nullable=True)
    planned_slot = Column(String, nullable=True)
    context_comments = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    daily_metric_date = Column(Date, ForeignKey('daily_metrics.date'), nullable=True)
    daily_metric = relationship("DailyMetrics", back_populates="calorie_entries")
