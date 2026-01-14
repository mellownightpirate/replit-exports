# Health Metrics Tracker

## Overview

A daily health metrics tracking application built with Streamlit and SQLAlchemy. It enables users to track daily health data such as steps, weight, calories burned, and calories consumed, alongside comprehensive protein tracking. The application supports CBT-E (Cognitive Behavioral Therapy - Enhanced) style fields for detailed eating disorder treatment monitoring. It provides daily summaries, granular calorie entry tracking, and visualizations for progress monitoring over time. The application allows for a one-time import of historical data via CSV and then relies on manual data entry for ongoing tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Choice**: Streamlit for rapid development of data-centric web applications.
**Visualization**: Plotly (Express and Graph Objects) for interactive charts.

### Backend Architecture

**Web Framework**: Streamlit, serving as both frontend and backend, using a single-file application structure with helper modules for separation of concerns.
**Helper Modules**: `calorie_helpers.py` (entry CRUD, daily summary), `settings_helpers.py` (UserSettings CRUD, target calculations), `aggregation_helpers.py` (weekly/monthly statistics).
**Session Management**: Streamlit's built-in session state.
**Data Flow**: Direct database queries via SQLAlchemy ORM.

### Data Storage

**Database**: SQLite (`health.db`) for lightweight, serverless data storage.
**ORM**: SQLAlchemy, with declarative models for `UserSettings`, `DailyMetrics`, and `CalorieEntry`.
**Relationships**: One-to-many between `DailyMetrics` and `CalorieEntry`, with `UserSettings` as a singleton.
**Data Integrity**: Automatic recomputation of aggregate fields (e.g., `calories_eaten`, `protein_total_g`) and automatic timestamp management.

### Key Architectural Decisions

**Initial Data Import**: A separate CLI script (`import_initial_csv.py`) handles one-time historical CSV data import, updating existing records or creating new ones from September 1, 2025, onwards.
**Calorie & Protein Tracking**: A two-level system with granular `CalorieEntry` records and aggregated `DailyMetrics` totals. `CalorieEntry` is the source of truth, triggering recomputation of `DailyMetrics` totals and dynamic targets.
**Dynamic Calorie Targets**: Targets adjust based on actual `calories_burned_total` and configured weight goal modes (Maintenance, Weight Loss with percentage-based deficits), with a fallback to `maintenance_calories` and a minimum floor of 1,200 kcal. Rolling average calculations are used for burn and deficit targets.
**Auto Protein Targets**: Automatically calculated as 2x body weight in kg, with a fallback to the most recent weight and support for manual overrides.
**Date-Based Data Access**: Date fields serve as primary and foreign keys for simplified, date-centric data operations.
**Weight Goal Management**: Implemented via `UserSettings` and a `mode` column in `DailyMetrics`, allowing for global goal settings and per-day overrides. This includes automatic target calculation and smart preservation of manual targets.
**Auto-Save Functionality**: All metric fields use `on_change` callbacks for instant persistence to the database, with status indicators for save success or failure.

### Data Model Schema

**UserSettings Table**: Stores global configuration including `maintenance_calories`, `current_mode`, and deficit percentages.
**DailyMetrics Table**: Contains daily health data such as `date`, `steps`, `weight_kg`, `calories_burned_total`, `calories_eaten`, `daily_calorie_target`, `protein_total_g`, `protein_target_g`, and `mode`.
**CalorieEntry Table**: Stores individual entries with `date`, `time`, `description`, `calories`, `protein_g`, `place`, `star_flag`, `vl_flag`, `planned_slot`, and `context_comments`.

## External Dependencies

### Core Framework Dependencies
- **Streamlit**: Web application framework.
- **SQLAlchemy**: ORM for database operations.
- **Pandas**: Data manipulation for CSV import.

### Visualization Libraries
- **Plotly**: Interactive charting library (`plotly.graph_objects`, `plotly.express`).

### Database
- **SQLite**: Local, file-based database (`health.db`).

### Data Sources
- **Initial Import**: CSV file from `attached_assets/amin_daily_energy_merged_steps_from_sheet_*.csv`.
- **Ongoing Data Entry**: Manual entry via Streamlit UI.