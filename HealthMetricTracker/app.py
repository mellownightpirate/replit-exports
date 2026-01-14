import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, date, timedelta, time as dt_time
from sqlalchemy.orm import Session
from database import SessionLocal, init_db
from models import DailyMetrics, CalorieEntry, WeightMode
from calorie_helpers import (
    get_calorie_entries, 
    add_calorie_entry, 
    delete_calorie_entry,
    get_daily_summary,
    upsert_metric,
    clear_day_data
)
from settings_helpers import (
    get_or_create_settings,
    update_settings,
    compute_target_from_settings,
    get_mode_display_name
)

init_db()

st.set_page_config(page_title="Health Metrics Tracker", layout="centered")

st.markdown("""
<style>
    .main .block-container {
        max-width: 600px;
        padding-top: 2rem;
    }
    .stage-header {
        text-align: center;
        margin-bottom: 1.5rem;
    }
    .stage-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.3rem;
    }
    .stage-subtitle {
        font-size: 0.9rem;
        color: #888;
    }
    .progress-dots {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin: 1.5rem 0;
    }
    .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ddd;
    }
    .dot.active {
        background: #4ECDC4;
    }
    .dot.completed {
        background: #2e7d32;
    }
    .big-input {
        font-size: 1.2rem;
    }
    .summary-card {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1rem 0;
    }
    .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
    }
    .summary-label {
        color: #666;
    }
    .summary-value {
        font-weight: 600;
    }
    .food-entry {
        background: #fff;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 0.8rem 1rem;
        margin-bottom: 0.5rem;
    }
    .nav-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
    }
</style>
""", unsafe_allow_html=True)

if 'stage' not in st.session_state:
    st.session_state.stage = 1
if 'last_save_time' not in st.session_state:
    st.session_state.last_save_time = None
if 'save_error' not in st.session_state:
    st.session_state.save_error = None

db = SessionLocal()
settings = get_or_create_settings(db)

def go_next():
    if st.session_state.stage < 5:
        st.session_state.stage += 1

def go_back():
    if st.session_state.stage > 1:
        st.session_state.stage -= 1

def go_to(stage):
    st.session_state.stage = stage

def render_progress_dots(current):
    dots_html = '<div class="progress-dots">'
    for i in range(1, 6):
        if i < current:
            dots_html += '<span class="dot completed"></span>'
        elif i == current:
            dots_html += '<span class="dot active"></span>'
        else:
            dots_html += '<span class="dot"></span>'
    dots_html += '</div>'
    st.markdown(dots_html, unsafe_allow_html=True)

selected_date = st.session_state.get('selected_date', date.today())
existing_data = db.query(DailyMetrics).filter(DailyMetrics.date == selected_date).first()
summary = get_daily_summary(db, selected_date)

def auto_save_metrics():
    try:
        data = {
            'date': selected_date,
            'steps': st.session_state.get('metrics_steps', 0) if st.session_state.get('metrics_steps', 0) > 0 else None,
            'weight_kg': st.session_state.get('metrics_weight', 0.0) if st.session_state.get('metrics_weight', 0.0) > 0 else None,
            'calories_burned_total': st.session_state.get('metrics_burn', 0.0) if st.session_state.get('metrics_burn', 0.0) > 0 else None,
            'mode': st.session_state.get('goal_mode', settings.current_mode)
        }
        protein_override = st.session_state.get('metrics_protein_target', 0.0)
        if protein_override > 0:
            data['protein_target_g'] = protein_override
        upsert_metric(db, data)
        st.session_state.last_save_time = datetime.now()
        st.session_state.save_error = None
    except Exception as e:
        st.session_state.save_error = str(e)

current_stage = st.session_state.stage

# ============================================================================
# STAGE 1: DATE & GOAL
# ============================================================================
if current_stage == 1:
    st.markdown('<div class="stage-header"><div class="stage-title">Select Date & Goal</div><div class="stage-subtitle">Choose the day you want to track</div></div>', unsafe_allow_html=True)
    render_progress_dots(1)
    
    new_date = st.date_input(
        "Date",
        value=selected_date,
        max_value=date.today(),
        key="date_picker"
    )
    if new_date != selected_date:
        st.session_state.selected_date = new_date
        st.rerun()
    
    st.write("")
    st.markdown("**Goal Mode**")
    
    mode_options = {
        WeightMode.MAINTENANCE: "Maintenance - Eat to match burn",
        WeightMode.LOSS_GENTLE: "Gentle Loss - Small deficit",
        WeightMode.LOSS_STANDARD: "Standard Loss - Moderate deficit",
        WeightMode.LOSS_AGGRESSIVE: "Aggressive Loss - Larger deficit"
    }
    current_mode = existing_data.mode if existing_data and existing_data.mode else settings.current_mode
    
    new_mode = st.radio(
        "Choose your goal",
        options=list(mode_options.keys()),
        index=list(mode_options.keys()).index(current_mode),
        format_func=lambda x: mode_options[x],
        key="goal_mode",
        label_visibility="collapsed"
    )
    
    if new_mode != current_mode:
        upsert_metric(db, {'date': selected_date, 'mode': new_mode})
        st.session_state.last_save_time = datetime.now()
    
    st.write("")
    col1, col2 = st.columns(2)
    with col2:
        if st.button("Next →", type="primary", use_container_width=True):
            go_next()
            st.rerun()

# ============================================================================
# STAGE 2: WEIGHT
# ============================================================================
elif current_stage == 2:
    st.markdown('<div class="stage-header"><div class="stage-title">Your Weight</div><div class="stage-subtitle">Morning weight works best</div></div>', unsafe_allow_html=True)
    render_progress_dots(2)
    
    current_weight = float(existing_data.weight_kg) if existing_data and existing_data.weight_kg else 0.0
    
    weight = st.number_input(
        "Weight (kg)",
        min_value=0.0,
        max_value=300.0,
        value=current_weight,
        step=0.1,
        format="%.1f",
        key="metrics_weight",
        on_change=auto_save_metrics
    )
    
    if weight > 0:
        protein_auto = weight * 2
        st.caption(f"Protein target will auto-set to {protein_auto:.0f}g (2g per kg)")
    
    st.write("")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("← Back", use_container_width=True):
            go_back()
            st.rerun()
    with col2:
        if st.button("Next →", type="primary", use_container_width=True):
            go_next()
            st.rerun()

# ============================================================================
# STAGE 3: ACTIVITY
# ============================================================================
elif current_stage == 3:
    st.markdown('<div class="stage-header"><div class="stage-title">Activity</div><div class="stage-subtitle">Your movement and energy burned</div></div>', unsafe_allow_html=True)
    render_progress_dots(3)
    
    current_steps = existing_data.steps if existing_data and existing_data.steps else 0
    current_burn = float(existing_data.calories_burned_total) if existing_data and existing_data.calories_burned_total else 0.0
    
    steps = st.number_input(
        "Steps",
        min_value=0,
        value=current_steps,
        step=500,
        key="metrics_steps",
        on_change=auto_save_metrics,
        help="From your phone or fitness tracker"
    )
    
    st.write("")
    
    burned = st.number_input(
        "Total Calories Burned (kcal)",
        min_value=0.0,
        value=current_burn,
        step=50.0,
        format="%.0f",
        key="metrics_burn",
        on_change=auto_save_metrics,
        help="Your total daily energy expenditure from watch/tracker"
    )
    
    st.write("")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("← Back", use_container_width=True):
            go_back()
            st.rerun()
    with col2:
        if st.button("Next →", type="primary", use_container_width=True):
            go_next()
            st.rerun()

# ============================================================================
# STAGE 4: FOOD JOURNAL
# ============================================================================
elif current_stage == 4:
    st.markdown('<div class="stage-header"><div class="stage-title">Food Journal</div><div class="stage-subtitle">Log what you ate</div></div>', unsafe_allow_html=True)
    render_progress_dots(4)
    
    entries = get_calorie_entries(db, selected_date)
    total_eaten = sum(e.calories for e in entries)
    total_protein = sum(e.protein_g or 0 for e in entries)
    
    st.markdown(f"**Today so far:** {total_eaten:,.0f} kcal · {total_protein:.0f}g protein")
    
    st.divider()
    
    with st.expander("➕ Add food entry", expanded=len(entries) == 0):
        with st.form("add_entry_form", clear_on_submit=True):
            entry_desc = st.text_input("What did you eat?", placeholder="e.g. Scrambled eggs with toast")
            
            c1, c2 = st.columns(2)
            with c1:
                entry_cal = st.number_input("Calories", min_value=0.0, step=10.0, format="%.0f")
            with c2:
                entry_prot = st.number_input("Protein (g)", min_value=0.0, step=1.0, format="%.0f")
            
            c3, c4 = st.columns(2)
            with c3:
                entry_time = st.time_input("Time", value=datetime.now().time())
            with c4:
                entry_slot = st.selectbox("Meal", ["Breakfast", "Lunch", "Dinner", "Snack", "Other"])
            
            with st.expander("More details"):
                entry_place = st.text_input("Place", placeholder="Home, Restaurant...")
                entry_comments = st.text_area("Notes", placeholder="Any context...", height=60)
                c5, c6 = st.columns(2)
                with c5:
                    entry_star = st.text_input("Star flag", max_chars=1, placeholder="*")
                with c6:
                    entry_vl = st.selectbox("V/L flag", ["", "V", "L"])
            
            if st.form_submit_button("Add Entry", type="primary", use_container_width=True):
                if entry_cal > 0:
                    add_calorie_entry(
                        db, selected_date, entry_time, entry_desc, entry_cal,
                        protein_g=entry_prot if entry_prot > 0 else None,
                        place=entry_place if entry_place else None,
                        star_flag=entry_star if entry_star else None,
                        vl_flag=entry_vl if entry_vl else None,
                        planned_slot=entry_slot,
                        context_comments=entry_comments if entry_comments else None
                    )
                    st.rerun()
    
    if entries:
        for entry in entries:
            with st.container():
                col_info, col_del = st.columns([5, 1])
                with col_info:
                    time_str = entry.time.strftime('%H:%M') if entry.time else ''
                    prot_str = f" · {entry.protein_g:.0f}g" if entry.protein_g else ""
                    st.markdown(f"**{time_str}** {entry.planned_slot or ''}")
                    st.write(f"{entry.description or 'No description'} — **{entry.calories:.0f} kcal**{prot_str}")
                    if entry.context_comments:
                        st.caption(entry.context_comments)
                with col_del:
                    if st.button("🗑", key=f"del_{entry.id}"):
                        delete_calorie_entry(db, entry.id)
                        st.rerun()
                st.divider()
    else:
        st.info("No entries yet. Add your first meal above.")
    
    st.write("")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("← Back", use_container_width=True):
            go_back()
            st.rerun()
    with col2:
        if st.button("View Summary →", type="primary", use_container_width=True):
            go_next()
            st.rerun()

# ============================================================================
# STAGE 5: SUMMARY
# ============================================================================
elif current_stage == 5:
    st.markdown('<div class="stage-header"><div class="stage-title">Daily Summary</div><div class="stage-subtitle">' + selected_date.strftime('%A, %B %d, %Y') + '</div></div>', unsafe_allow_html=True)
    render_progress_dots(5)
    
    summary = get_daily_summary(db, selected_date)
    
    eaten = summary.get('calories_eaten', 0)
    burned = summary.get('calories_burned_total', 0)
    target = summary.get('daily_calorie_target', 0)
    balance = summary.get('calorie_balance', 0)
    protein_total = summary.get('protein_total_g', 0)
    protein_target = summary.get('protein_target_g', 0)
    weight = summary.get('weight_kg', 0)
    steps = summary.get('steps', 0)
    mode = summary.get('mode', settings.current_mode)
    
    st.markdown(f"**Goal:** {get_mode_display_name(mode)}")
    
    st.markdown("---")
    
    c1, c2, c3 = st.columns(3)
    with c1:
        st.metric("Eaten", f"{eaten:,.0f}", delta=None)
        st.caption("kcal")
    with c2:
        st.metric("Burned", f"{burned:,.0f}", delta=None)
        st.caption("kcal")
    with c3:
        delta_color = "inverse" if balance < 0 else "normal"
        st.metric("Balance", f"{balance:+,.0f}", delta=None)
        st.caption("kcal")
    
    st.markdown("---")
    
    if target > 0:
        pct = min(eaten / target * 100, 100)
        st.progress(pct / 100, text=f"Calorie target: {eaten:,.0f} / {target:,.0f} kcal ({pct:.0f}%)")
    
    if protein_target and protein_target > 0:
        prot_pct = min(protein_total / protein_target * 100, 100)
        st.progress(prot_pct / 100, text=f"Protein: {protein_total:.0f} / {protein_target:.0f}g ({prot_pct:.0f}%)")
    
    st.markdown("---")
    
    d1, d2 = st.columns(2)
    with d1:
        if weight:
            st.write(f"**Weight:** {weight:.1f} kg")
        else:
            st.write("**Weight:** Not logged")
    with d2:
        if steps:
            st.write(f"**Steps:** {steps:,}")
        else:
            st.write("**Steps:** Not logged")
    
    summary_text = summary.get('summary_text', '')
    if summary_text:
        st.info(summary_text)
    
    st.markdown("---")
    
    with st.expander("7-Day Trends"):
        avg_burn = summary.get('avg_calories_burned_last_7_days', 0)
        avg_deficit = summary.get('avg_daily_deficit_last_7_days', 0)
        avg_protein = summary.get('avg_protein_last_7_days')
        avg_weight = summary.get('avg_weight_last_7_days')
        
        st.write(f"Avg burn: **{avg_burn:,.0f}** kcal/day")
        st.write(f"Avg deficit: **{avg_deficit:+,.0f}** kcal/day")
        if avg_protein:
            st.write(f"Avg protein: **{avg_protein:.0f}**g/day")
        if avg_weight:
            st.write(f"Avg weight: **{avg_weight:.1f}** kg")
    
    st.write("")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        if st.button("← Edit", use_container_width=True):
            go_back()
            st.rerun()
    with col2:
        if st.button("New Day", use_container_width=True):
            st.session_state.selected_date = date.today()
            st.session_state.stage = 1
            st.rerun()
    with col3:
        if st.button("History", use_container_width=True):
            st.session_state.stage = 6
            st.rerun()

# ============================================================================
# STAGE 6: HISTORY (Optional extra view)
# ============================================================================
elif current_stage == 6:
    st.markdown('<div class="stage-header"><div class="stage-title">History</div><div class="stage-subtitle">Your progress over time</div></div>', unsafe_allow_html=True)
    
    from_date = date(2025, 9, 1)
    to_date = date.today()
    
    metrics = db.query(DailyMetrics).filter(
        DailyMetrics.date >= from_date,
        DailyMetrics.date <= to_date
    ).order_by(DailyMetrics.date.desc()).all()
    
    if metrics:
        data_list = [{
            'Date': m.date,
            'Weight': m.weight_kg,
            'Eaten': m.calories_eaten,
            'Burned': m.calories_burned_total,
            'Target': m.daily_calorie_target,
            'Balance': m.calorie_balance,
            'Protein': m.protein_total_g
        } for m in metrics]
        
        df = pd.DataFrame(data_list)
        
        tab1, tab2 = st.tabs(["Charts", "Table"])
        
        with tab1:
            df_sorted = df.sort_values('Date')
            
            st.markdown("**Weight Trend**")
            df_w = df_sorted[df_sorted['Weight'].notna()]
            if not df_w.empty:
                fig = px.line(df_w, x='Date', y='Weight', markers=True)
                fig.update_layout(showlegend=False, margin=dict(l=0,r=0,t=10,b=0), height=200)
                st.plotly_chart(fig, use_container_width=True)
            
            st.markdown("**Calorie Balance (7-day avg)**")
            df_b = df_sorted[df_sorted['Balance'].notna()]
            if not df_b.empty and len(df_b) >= 3:
                df_b = df_b.copy()
                df_b['Rolling'] = df_b['Balance'].rolling(7, min_periods=1).mean()
                fig = go.Figure()
                fig.add_trace(go.Scatter(x=df_b['Date'], y=df_b['Rolling'], mode='lines', line=dict(color='#4ECDC4', width=2)))
                fig.add_hline(y=0, line_dash="dash", line_color="gray")
                fig.update_layout(showlegend=False, margin=dict(l=0,r=0,t=10,b=0), height=200)
                st.plotly_chart(fig, use_container_width=True)
        
        with tab2:
            st.dataframe(df, height=400, use_container_width=True)
    else:
        st.info("No historical data yet.")
    
    st.write("")
    if st.button("← Back to Summary", use_container_width=True):
        st.session_state.stage = 5
        st.rerun()

db.close()
