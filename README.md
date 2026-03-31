# ttmini
AI Food Tracker and Dashboard

ttmini is a lightweight web application for tracking your daily food intake with AI-powered food search and a 7-day nutrition dashboard.

## Features

- **AI food search** – fuzzy-matching food lookup across 50+ common foods; shows nutrition data in real-time as you type
- **Food logging** – log meals (breakfast, lunch, dinner, snack) with custom gram quantities
- **Today's summary** – instant macro totals (calories, protein, carbs, fat) updated as you add/remove entries
- **Dashboard** – interactive 7-day charts for calories and macros built with Chart.js
- **REST API** – simple JSON endpoints for search, add, list, and delete entries

## Quick start

```bash
# 1. Create a virtual environment (recommended)
python3 -m venv .venv && source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the app
python app.py
```

Then open <http://127.0.0.1:5000> in your browser.

## Running tests

```bash
pytest tests/
```

## Project structure

```
ttmini/
├── app.py               # Flask application (backend + AI food matcher)
├── requirements.txt
├── static/
│   ├── css/style.css
│   └── js/
│       ├── app.js       # Frontend logic (search, add, delete)
│       └── chart.umd.min.js
└── templates/
    ├── base.html
    ├── index.html       # Food logging page
    └── dashboard.html   # 7-day nutrition dashboard
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///ttmini.db` | SQLAlchemy database URL |
| `SECRET_KEY` | `ttmini-dev-key` | Flask secret key |
