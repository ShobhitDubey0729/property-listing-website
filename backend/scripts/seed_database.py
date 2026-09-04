"""Run: python -m scripts.seed_database  (from backend/)"""

from app.database import Base, engine
from app.models import *  # noqa: F401
from app.services.seed import seed_force


def main():
    Base.metadata.create_all(bind=engine)
    seed_force()


if __name__ == "__main__":
    main()
