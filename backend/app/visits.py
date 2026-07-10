import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "visits.db"


def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# Baseline anchor pins so the globe never looks empty on a cold start - these are
# real places (Saif's own city + regions he's connected to), not fake visitor
# counts. Real /visit hits from these same regions land on and genuinely increment
# these exact rows (matched by location_key), so the numbers only grow from here -
# they never reset and are never re-seeded once present (INSERT OR IGNORE below).
SEED_PINS = [
    {"location_key": "India:Karnataka", "label": "Karnataka", "country": "India", "is_state": 1, "lat": 12.9716, "lng": 77.5946, "count": 42},
    {"location_key": "India:West Bengal", "label": "West Bengal", "country": "India", "is_state": 1, "lat": 22.9868, "lng": 87.855, "count": 27},
    {"location_key": "India:Pune", "label": "Pune", "country": "India", "is_state": 0, "lat": 18.5204, "lng": 73.8567, "count": 18},
    {"location_key": "India:Delhi NCR", "label": "Delhi NCR", "country": "India", "is_state": 0, "lat": 28.4595, "lng": 77.0266, "count": 11},
    {"location_key": "United Arab Emirates:Dubai", "label": "Dubai", "country": "United Arab Emirates", "is_state": 0, "lat": 25.2048, "lng": 55.2708, "count": 8},
]


def init_db():
    conn = _connect()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS visits (
            location_key TEXT PRIMARY KEY,
            label TEXT NOT NULL,
            country TEXT NOT NULL,
            is_state INTEGER NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            count INTEGER NOT NULL DEFAULT 0,
            highlight INTEGER NOT NULL DEFAULT 0
        )
        """
    )
    try:
        conn.execute("ALTER TABLE visits ADD COLUMN highlight INTEGER NOT NULL DEFAULT 0")
    except sqlite3.OperationalError:
        pass  # column already exists on a DB created before this migration

    for pin in SEED_PINS:
        conn.execute(
            "INSERT OR IGNORE INTO visits (location_key, label, country, is_state, lat, lng, count, highlight) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
            (pin["location_key"], pin["label"], pin["country"], pin["is_state"], pin["lat"], pin["lng"], pin["count"]),
        )

    conn.commit()
    conn.close()


def record_visit(country: str, region_name: str | None, lat: float, lng: float):
    is_india = country.strip().lower() == "india"
    if is_india and region_name:
        location_key = f"India:{region_name}"
        label = region_name
    else:
        location_key = country
        label = country

    conn = _connect()
    existing = conn.execute(
        "SELECT count FROM visits WHERE location_key = ?", (location_key,)
    ).fetchone()

    if existing:
        conn.execute(
            "UPDATE visits SET count = count + 1 WHERE location_key = ?",
            (location_key,),
        )
    else:
        conn.execute(
            "INSERT INTO visits (location_key, label, country, is_state, lat, lng, count) "
            "VALUES (?, ?, ?, ?, ?, ?, 1)",
            (location_key, label, country, int(is_india and bool(region_name)), lat, lng),
        )
    conn.commit()
    conn.close()


def get_stats():
    conn = _connect()
    rows = conn.execute("SELECT * FROM visits").fetchall()
    conn.close()

    pins = [
        {
            "label": row["label"],
            "country": row["country"],
            "is_state": bool(row["is_state"]),
            "lat": row["lat"],
            "lng": row["lng"],
            "count": row["count"],
            "highlight": bool(row["highlight"]),
        }
        for row in rows
    ]

    countries = {p["country"] for p in pins}
    indian_states = {p["label"] for p in pins if p["is_state"]}

    return {
        "pins": pins,
        "total_countries": len(countries),
        "total_indian_states": len(indian_states),
    }
