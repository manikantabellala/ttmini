"""Tests for ttmini Flask application."""

import json
from datetime import date, timedelta

import pytest

from app import FoodEntry, _ai_lookup, _sum_entries, app, db


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture()
def client(tmp_path):
    """Create a test client with an in-memory SQLite database."""
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


# ---------------------------------------------------------------------------
# AI lookup tests
# ---------------------------------------------------------------------------


def test_ai_lookup_exact():
    result = _ai_lookup("apple")
    assert result is not None
    assert result["name"] == "apple"
    assert result["calories"] == 52


def test_ai_lookup_case_insensitive():
    result = _ai_lookup("Apple")
    assert result is not None
    assert result["name"] == "apple"


def test_ai_lookup_fuzzy():
    # "chiken" is a typo for "chicken breast"
    result = _ai_lookup("chiken breast")
    assert result is not None
    assert "chicken" in result["name"]


def test_ai_lookup_partial():
    result = _ai_lookup("brown rice")
    assert result is not None
    assert result["name"] == "brown rice"


def test_ai_lookup_unknown():
    result = _ai_lookup("xyzunknownfood99")
    assert result is None


def test_ai_lookup_empty():
    result = _ai_lookup("")
    assert result is None


# ---------------------------------------------------------------------------
# _sum_entries helper
# ---------------------------------------------------------------------------


def test_sum_entries_empty():
    assert _sum_entries([]) == {"calories": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0}


def test_sum_entries_multiple():
    e1 = FoodEntry(food_name="a", quantity_grams=100, calories=100, protein_g=10, carbs_g=20, fat_g=5)
    e2 = FoodEntry(food_name="b", quantity_grams=50, calories=50, protein_g=5, carbs_g=10, fat_g=2.5)
    result = _sum_entries([e1, e2])
    assert result["calories"] == 150.0
    assert result["protein"] == 15.0
    assert result["carbs"] == 30.0
    assert result["fat"] == 7.5


# ---------------------------------------------------------------------------
# API: search
# ---------------------------------------------------------------------------


def test_search_known_food(client):
    rv = client.get("/api/search?q=banana")
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["name"] == "banana"
    assert data["calories"] == 89


def test_search_missing_query(client):
    rv = client.get("/api/search")
    assert rv.status_code == 400


def test_search_unknown_food(client):
    rv = client.get("/api/search?q=xyznotafood999")
    assert rv.status_code == 404


# ---------------------------------------------------------------------------
# API: add entry
# ---------------------------------------------------------------------------


def test_add_entry_known_food(client):
    payload = {"food_name": "apple", "quantity_grams": 150, "meal_type": "breakfast"}
    rv = client.post("/api/entries", json=payload)
    assert rv.status_code == 201
    data = rv.get_json()
    assert data["food_name"] == "apple"
    assert data["quantity_grams"] == 150
    # 52 kcal/100g * 1.5 = 78
    assert data["calories"] == pytest.approx(78.0, rel=0.01)
    assert data["meal_type"] == "breakfast"


def test_add_entry_unknown_food_gets_zero_nutrition(client):
    payload = {"food_name": "mystery substance", "quantity_grams": 100}
    rv = client.post("/api/entries", json=payload)
    assert rv.status_code == 201
    data = rv.get_json()
    assert data["calories"] == 0.0


def test_add_entry_missing_food_name(client):
    rv = client.post("/api/entries", json={"quantity_grams": 100})
    assert rv.status_code == 400


def test_add_entry_invalid_quantity(client):
    rv = client.post("/api/entries", json={"food_name": "apple", "quantity_grams": -10})
    assert rv.status_code == 400


def test_add_entry_zero_quantity(client):
    rv = client.post("/api/entries", json={"food_name": "apple", "quantity_grams": 0})
    assert rv.status_code == 400


def test_add_entry_default_quantity(client):
    rv = client.post("/api/entries", json={"food_name": "oats"})
    assert rv.status_code == 201
    data = rv.get_json()
    assert data["quantity_grams"] == 100


def test_add_entry_with_date(client):
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    rv = client.post("/api/entries", json={"food_name": "egg", "logged_date": yesterday})
    assert rv.status_code == 201
    data = rv.get_json()
    assert data["logged_date"] == yesterday


def test_add_entry_invalid_meal_type_defaults_to_snack(client):
    rv = client.post("/api/entries", json={"food_name": "apple", "meal_type": "brunch"})
    assert rv.status_code == 201
    assert rv.get_json()["meal_type"] == "snack"


# ---------------------------------------------------------------------------
# API: list & delete entries
# ---------------------------------------------------------------------------


def test_list_entries_empty(client):
    rv = client.get("/api/entries")
    assert rv.status_code == 200
    assert rv.get_json() == []


def test_list_entries_by_date(client):
    today = date.today().isoformat()
    client.post("/api/entries", json={"food_name": "apple", "logged_date": today})
    rv = client.get(f"/api/entries?date={today}")
    assert rv.status_code == 200
    data = rv.get_json()
    assert len(data) == 1
    assert data[0]["food_name"] == "apple"


def test_list_entries_invalid_date(client):
    rv = client.get("/api/entries?date=not-a-date")
    assert rv.status_code == 400


def test_delete_entry(client):
    rv = client.post("/api/entries", json={"food_name": "apple"})
    entry_id = rv.get_json()["id"]
    rv = client.delete(f"/api/entries/{entry_id}")
    assert rv.status_code == 200
    assert rv.get_json()["deleted"] == entry_id
    # Confirm gone
    rv2 = client.get("/api/entries")
    assert all(e["id"] != entry_id for e in rv2.get_json())


def test_delete_nonexistent_entry(client):
    rv = client.delete("/api/entries/99999")
    assert rv.status_code == 404


# ---------------------------------------------------------------------------
# Page routes
# ---------------------------------------------------------------------------


def test_index_page(client):
    rv = client.get("/")
    assert rv.status_code == 200
    assert b"ttmini" in rv.data


def test_dashboard_page(client):
    rv = client.get("/dashboard")
    assert rv.status_code == 200
    assert b"Dashboard" in rv.data
