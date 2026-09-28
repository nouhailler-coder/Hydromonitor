"""Development seed runner for PostgreSQL/PostGIS."""
import argparse
import os
from pathlib import Path
from sqlalchemy import create_engine, text


def run_seed(database_url: str) -> None:
    sql_path = Path(__file__).parent / "01_dev_seed_france.sql"
    sql_content = sql_path.read_text(encoding="utf-8")
    engine = create_engine(database_url)
    with engine.begin() as conn:
        conn.execute(text(sql_content))
    print(f"[SEED] Successfully applied development seed from {sql_path.name}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed HydroMonitor development database")
    parser.add_argument("--env", default="dev", choices=["dev"], help="Target environment (strictly dev)")
    args = parser.parse_args()
    db_url = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://hydromonitor:hydromonitor_dev@localhost:5432/hydromonitor",
    )
    run_seed(db_url)
