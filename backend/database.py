from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from sqlalchemy.ext.declarative import declarative_base
import os

#  Force load .env from same folder
load_dotenv(dotenv_path=".env")

DATABASE_URL = os.getenv("DATABASE_URL")

print("DB URL:", DATABASE_URL)  # 👈 DEBUG

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()