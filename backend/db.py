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
            etco2 REAL,
            risk_score REAL
        )
        ''')
        conn.commit()

def insert_vital(record):
    conn = sqlite3.connect(DB_PATH)
    with closing(conn):
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO vitals (patient_id,timestamp,hr,spo2,rr,systolic,diastolic,temp,etco2,risk_score) VALUES (?,?,?,?,?,?,?,?,?,?)",
            (
                record.get("patient_id"),
                record.get("timestamp"),
                record.get("hr") or record.get("HR"),
                record.get("spo2") or record.get("SpO2"),
                record.get("rr") or record.get("RespRate"),
                record.get("systolic") or record.get("NISysABP"),
                record.get("diastolic") or record.get("NIDiasABP"),
                record.get("temp") or record.get("Temp"),
                record.get("etco2") or record.get("EtCO2"),
                record.get("risk_score", 0),
            ),
        )
        conn.commit()

def get_latest_vitals(patient_id, limit=10):
    """Get the latest vital readings for a patient."""
    conn = sqlite3.connect(DB_PATH)
    with closing(conn):
        cur = conn.cursor()
        cur.execute(
            "SELECT timestamp,hr,spo2,rr,systolic,diastolic,temp,etco2,risk_score FROM vitals WHERE patient_id=? ORDER BY timestamp DESC LIMIT ?",
            (patient_id, limit)
        )
        rows = cur.fetchall()
    return rows

def get_top_patients(limit=6):
    """Get top N patients by latest risk score."""
    conn = sqlite3.connect(DB_PATH)
    with closing(conn):
        cur = conn.cursor()
        cur.execute("""
            SELECT patient_id, risk_score, timestamp FROM vitals
            WHERE (patient_id, timestamp) IN (
                SELECT patient_id, MAX(timestamp) FROM vitals GROUP BY patient_id
            )
            ORDER BY risk_score DESC
            LIMIT ?
        """, (limit,))
        rows = cur.fetchall()
    return rows
