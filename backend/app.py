from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from db import init_db, insert_vital, get_latest_vitals, get_top_patients
from inference import get_engine

app = FastAPI()
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

inference_engine = get_engine()


class VitalRecord(BaseModel):
    patient_id: str
    timestamp: float
    HR: float = None
    RespRate: float = None
    Temp: float = None
    NISysABP: float = None
    NIDiasABP: float = None
    SpO2: float = None
    EtCO2: float = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ingest")
def ingest_vital(vital: VitalRecord):
    """Ingest a vital sign reading, compute risk score, and store."""
    vital_dict = vital.dict(exclude_none=True)
    
    # Compute risk score via inference engine
    risk_score = inference_engine.add_vital(vital_dict['patient_id'], vital_dict)
    vital_dict['risk_score'] = risk_score
    
    # Store to database
    insert_vital(vital_dict)
    
    return {"patient_id": vital_dict['patient_id'], "risk_score": risk_score, "stored": True}


@app.get("/patients")
def get_patients():
    """Return top 6 patients by current risk score."""
    top_patients = get_top_patients(6)
    return {
        "patients": [
            {"patient_id": pid, "risk": risk, "timestamp": ts}
            for pid, risk, ts in top_patients
        ]
    }


@app.get("/patient/{patient_id}")
def get_patient(patient_id: str):
    """Get patient details and recent vitals."""
    vitals = get_latest_vitals(patient_id, limit=20)
    risk = inference_engine.get_risk_score(patient_id)
    return {
        "patient_id": patient_id,
        "risk": risk,
        "vitals": [
            {
                "timestamp": v[0],
                "hr": v[1],
                "spo2": v[2],
                "rr": v[3],
                "systolic": v[4],
                "diastolic": v[5],
                "temp": v[6],
                "etco2": v[7],
                "risk_score": v[8]
            }
            for v in vitals
        ]
    }


@app.get("/scores")
def get_scores():
    """Get all live risk scores."""
    return inference_engine.get_all_scores()
