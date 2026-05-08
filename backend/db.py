import sqlite3
from contextlib import closing

DB_PATH = "backend/data/vitals.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    with closing(conn):
        cur = conn.cursor()
        cur.execute('''
        CREATE TABLE IF NOT EXISTS vitals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id TEXT,
            timestamp REAL,
            hr REAL,
            spo2 REAL,
            rr REAL,
            systolic REAL,
            diastolic REAL,
            temp REAL,
            etco2 REAL
        )
        ''')
        conn.commit()

def insert_vital(record):
    conn = sqlite3.connect(DB_PATH)
    with closing(conn):
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO vitals (patient_id,timestamp,hr,spo2,rr,systolic,diastolic,temp,etco2) VALUES (?,?,?,?,?,?,?,?,?)",
            (
                record.get("patient_id"),
                record.get("timestamp"),
                record.get("hr"),
                record.get("spo2"),
                record.get("rr"),
                record.get("systolic"),
                record.get("diastolic"),
                record.get("temp"),
                record.get("etco2"),
            ),
        )
        conn.commit()
