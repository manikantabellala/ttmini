"""ttmini – AI Food Tracker and Dashboard."""

import difflib
import json
import os
from datetime import date, timedelta

from flask import Flask, jsonify, redirect, render_template, request, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", "sqlite:///ttmini.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "ttmini-dev-key")

db = SQLAlchemy(app)

# ---------------------------------------------------------------------------
# Database models
# ---------------------------------------------------------------------------


class FoodEntry(db.Model):
    """A single logged food item."""

    __tablename__ = "food_entries"

    id = db.Column(db.Integer, primary_key=True)
    food_name = db.Column(db.String(120), nullable=False)
    quantity_grams = db.Column(db.Float, nullable=False, default=100.0)
    calories = db.Column(db.Float, nullable=False, default=0.0)
    protein_g = db.Column(db.Float, nullable=False, default=0.0)
    carbs_g = db.Column(db.Float, nullable=False, default=0.0)
    fat_g = db.Column(db.Float, nullable=False, default=0.0)
    logged_date = db.Column(db.Date, nullable=False, default=date.today)
    meal_type = db.Column(db.String(20), nullable=False, default="snack")

    def to_dict(self):
        return {
            "id": self.id,
            "food_name": self.food_name,
            "quantity_grams": self.quantity_grams,
            "calories": self.calories,
            "protein_g": self.protein_g,
            "carbs_g": self.carbs_g,
            "fat_g": self.fat_g,
            "logged_date": self.logged_date.isoformat(),
            "meal_type": self.meal_type,
        }


# ---------------------------------------------------------------------------
# Built-in nutrition database (per 100 g)
# ---------------------------------------------------------------------------

_NUTRITION_DB: list[dict] = [
    {"name": "apple", "calories": 52, "protein": 0.3, "carbs": 14.0, "fat": 0.2},
    {"name": "banana", "calories": 89, "protein": 1.1, "carbs": 23.0, "fat": 0.3},
    {"name": "orange", "calories": 47, "protein": 0.9, "carbs": 12.0, "fat": 0.1},
    {"name": "grapes", "calories": 67, "protein": 0.6, "carbs": 17.0, "fat": 0.4},
    {"name": "strawberry", "calories": 32, "protein": 0.7, "carbs": 7.7, "fat": 0.3},
    {"name": "watermelon", "calories": 30, "protein": 0.6, "carbs": 7.6, "fat": 0.2},
    {"name": "mango", "calories": 60, "protein": 0.8, "carbs": 15.0, "fat": 0.4},
    {"name": "pineapple", "calories": 50, "protein": 0.5, "carbs": 13.0, "fat": 0.1},
    {"name": "blueberry", "calories": 57, "protein": 0.7, "carbs": 14.0, "fat": 0.3},
    {"name": "avocado", "calories": 160, "protein": 2.0, "carbs": 9.0, "fat": 15.0},
    # Vegetables
    {"name": "broccoli", "calories": 34, "protein": 2.8, "carbs": 7.0, "fat": 0.4},
    {"name": "spinach", "calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4},
    {"name": "carrot", "calories": 41, "protein": 0.9, "carbs": 10.0, "fat": 0.2},
    {"name": "tomato", "calories": 18, "protein": 0.9, "carbs": 3.9, "fat": 0.2},
    {"name": "cucumber", "calories": 15, "protein": 0.7, "carbs": 3.6, "fat": 0.1},
    {"name": "lettuce", "calories": 15, "protein": 1.4, "carbs": 2.9, "fat": 0.2},
    {"name": "potato", "calories": 77, "protein": 2.0, "carbs": 17.0, "fat": 0.1},
    {"name": "sweet potato", "calories": 86, "protein": 1.6, "carbs": 20.0, "fat": 0.1},
    {"name": "onion", "calories": 40, "protein": 1.1, "carbs": 9.3, "fat": 0.1},
    {"name": "garlic", "calories": 149, "protein": 6.4, "carbs": 33.0, "fat": 0.5},
    # Proteins
    {"name": "chicken breast", "calories": 165, "protein": 31.0, "carbs": 0.0, "fat": 3.6},
    {"name": "beef", "calories": 250, "protein": 26.0, "carbs": 0.0, "fat": 17.0},
    {"name": "salmon", "calories": 208, "protein": 20.0, "carbs": 0.0, "fat": 13.0},
    {"name": "tuna", "calories": 116, "protein": 26.0, "carbs": 0.0, "fat": 1.0},
    {"name": "egg", "calories": 155, "protein": 13.0, "carbs": 1.1, "fat": 11.0},
    {"name": "shrimp", "calories": 99, "protein": 24.0, "carbs": 0.2, "fat": 0.3},
    {"name": "tofu", "calories": 76, "protein": 8.0, "carbs": 1.9, "fat": 4.8},
    {"name": "lentils", "calories": 116, "protein": 9.0, "carbs": 20.0, "fat": 0.4},
    {"name": "chickpeas", "calories": 164, "protein": 8.9, "carbs": 27.0, "fat": 2.6},
    {"name": "black beans", "calories": 132, "protein": 8.9, "carbs": 24.0, "fat": 0.5},
    # Grains
    {"name": "white rice", "calories": 130, "protein": 2.7, "carbs": 28.0, "fat": 0.3},
    {"name": "brown rice", "calories": 123, "protein": 2.7, "carbs": 26.0, "fat": 1.0},
    {"name": "oats", "calories": 389, "protein": 17.0, "carbs": 66.0, "fat": 7.0},
    {"name": "bread", "calories": 265, "protein": 9.0, "carbs": 49.0, "fat": 3.2},
    {"name": "pasta", "calories": 158, "protein": 5.8, "carbs": 31.0, "fat": 0.9},
    {"name": "quinoa", "calories": 120, "protein": 4.4, "carbs": 22.0, "fat": 1.9},
    {"name": "corn", "calories": 86, "protein": 3.3, "carbs": 19.0, "fat": 1.4},
    # Dairy
    {"name": "milk", "calories": 61, "protein": 3.2, "carbs": 4.8, "fat": 3.3},
    {"name": "yogurt", "calories": 59, "protein": 3.5, "carbs": 3.6, "fat": 3.3},
    {"name": "cheese", "calories": 402, "protein": 25.0, "carbs": 1.3, "fat": 33.0},
    {"name": "butter", "calories": 717, "protein": 0.9, "carbs": 0.1, "fat": 81.0},
    # Nuts & seeds
    {"name": "almonds", "calories": 579, "protein": 21.0, "carbs": 22.0, "fat": 50.0},
    {"name": "walnuts", "calories": 654, "protein": 15.0, "carbs": 14.0, "fat": 65.0},
    {"name": "peanuts", "calories": 567, "protein": 26.0, "carbs": 16.0, "fat": 49.0},
    {"name": "chia seeds", "calories": 486, "protein": 17.0, "carbs": 42.0, "fat": 31.0},
    {"name": "sunflower seeds", "calories": 584, "protein": 21.0, "carbs": 20.0, "fat": 51.0},
    # Beverages / other
    {"name": "orange juice", "calories": 45, "protein": 0.7, "carbs": 10.0, "fat": 0.2},
    {"name": "coffee", "calories": 2, "protein": 0.3, "carbs": 0.0, "fat": 0.0},
    {"name": "green tea", "calories": 1, "protein": 0.2, "carbs": 0.2, "fat": 0.0},
    {"name": "olive oil", "calories": 884, "protein": 0.0, "carbs": 0.0, "fat": 100.0},
    {"name": "honey", "calories": 304, "protein": 0.3, "carbs": 82.0, "fat": 0.0},
]

_FOOD_NAMES = [f["name"] for f in _NUTRITION_DB]


def _ai_lookup(query: str) -> dict | None:
    """AI-assisted food lookup using fuzzy string matching.

    Returns nutrition data (per 100 g) for the best-matching food, or None.
    """
    q = query.strip().lower()
    if not q:
        return None
    # Exact match first
    for food in _NUTRITION_DB:
        if food["name"] == q:
            return food
    # Fuzzy match via SequenceMatcher
    matches = difflib.get_close_matches(q, _FOOD_NAMES, n=1, cutoff=0.5)
    if matches:
        for food in _NUTRITION_DB:
            if food["name"] == matches[0]:
                return food
    # Partial / substring match
    for food in _NUTRITION_DB:
        if q in food["name"] or food["name"] in q:
            return food
    return None


# ---------------------------------------------------------------------------
# Routes – pages
# ---------------------------------------------------------------------------


@app.route("/")
def index():
    today = date.today()
    entries = FoodEntry.query.filter_by(logged_date=today).order_by(FoodEntry.id).all()
    totals = _sum_entries(entries)
    return render_template("index.html", entries=entries, totals=totals, today=today)


@app.route("/dashboard")
def dashboard():
    end = date.today()
    start = end - timedelta(days=6)
    entries = (
        FoodEntry.query.filter(
            FoodEntry.logged_date >= start, FoodEntry.logged_date <= end
        )
        .order_by(FoodEntry.logged_date)
        .all()
    )
    # Aggregate by date
    by_date: dict[str, dict] = {}
    for delta in range(7):
        d = (start + timedelta(days=delta)).isoformat()
        by_date[d] = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
    for e in entries:
        d = e.logged_date.isoformat()
        by_date[d]["calories"] += e.calories
        by_date[d]["protein"] += e.protein_g
        by_date[d]["carbs"] += e.carbs_g
        by_date[d]["fat"] += e.fat_g

    chart_data = json.dumps(
        {
            "labels": list(by_date.keys()),
            "calories": [round(v["calories"], 1) for v in by_date.values()],
            "protein": [round(v["protein"], 1) for v in by_date.values()],
            "carbs": [round(v["carbs"], 1) for v in by_date.values()],
            "fat": [round(v["fat"], 1) for v in by_date.values()],
        }
    )

    today = date.today()
    today_entries = [e for e in entries if e.logged_date == today]
    today_totals = _sum_entries(today_entries)

    return render_template(
        "dashboard.html",
        chart_data=chart_data,
        today_totals=today_totals,
        today=today,
    )


# ---------------------------------------------------------------------------
# Routes – API
# ---------------------------------------------------------------------------


@app.route("/api/search")
def api_search():
    """AI food search: returns best-matching nutrition data."""
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"error": "query required"}), 400
    result = _ai_lookup(q)
    if result is None:
        return jsonify({"error": "food not found"}), 404
    return jsonify(result)


@app.route("/api/entries", methods=["POST"])
def api_add_entry():
    """Log a food entry."""
    data = request.get_json(force=True)
    food_name = (data.get("food_name") or "").strip()
    if not food_name:
        return jsonify({"error": "food_name required"}), 400

    try:
        quantity = float(data.get("quantity_grams", 100))
    except (TypeError, ValueError):
        return jsonify({"error": "quantity_grams must be a number"}), 400

    if quantity <= 0:
        return jsonify({"error": "quantity_grams must be positive"}), 400

    meal_type = data.get("meal_type", "snack")
    if meal_type not in ("breakfast", "lunch", "dinner", "snack"):
        meal_type = "snack"

    # Try to get date from payload; fall back to today
    logged_date = date.today()
    raw_date = data.get("logged_date")
    if raw_date:
        try:
            logged_date = date.fromisoformat(raw_date)
        except ValueError:
            pass

    # Look up nutrition via AI matcher
    nutrition = _ai_lookup(food_name) or {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0,
    }
    factor = quantity / 100.0

    entry = FoodEntry(
        food_name=food_name,
        quantity_grams=quantity,
        calories=round(nutrition["calories"] * factor, 1),
        protein_g=round(nutrition["protein"] * factor, 1),
        carbs_g=round(nutrition["carbs"] * factor, 1),
        fat_g=round(nutrition["fat"] * factor, 1),
        logged_date=logged_date,
        meal_type=meal_type,
    )
    db.session.add(entry)
    db.session.commit()
    return jsonify(entry.to_dict()), 201


@app.route("/api/entries/<int:entry_id>", methods=["DELETE"])
def api_delete_entry(entry_id):
    entry = db.session.get(FoodEntry, entry_id)
    if entry is None:
        return jsonify({"error": "not found"}), 404
    db.session.delete(entry)
    db.session.commit()
    return jsonify({"deleted": entry_id})


@app.route("/api/entries")
def api_list_entries():
    """List entries, optionally filtered by date."""
    raw = request.args.get("date")
    if raw:
        try:
            d = date.fromisoformat(raw)
        except ValueError:
            return jsonify({"error": "invalid date"}), 400
        entries = FoodEntry.query.filter_by(logged_date=d).order_by(FoodEntry.id).all()
    else:
        entries = FoodEntry.query.order_by(FoodEntry.logged_date, FoodEntry.id).all()
    return jsonify([e.to_dict() for e in entries])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _sum_entries(entries) -> dict:
    totals = {"calories": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0}
    for e in entries:
        totals["calories"] += e.calories
        totals["protein"] += e.protein_g
        totals["carbs"] += e.carbs_g
        totals["fat"] += e.fat_g
    return {k: round(v, 1) for k, v in totals.items()}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug)
