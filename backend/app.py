from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import init_db

app = FastAPI()
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory cache for latest patient scores (mocked by frontend until ML integrated)
latest_scores = {}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/patients")
def patients():
    # Return top 6 patients by risk (placeholder)
    sample = [
        {"patient_id": f"P{i}", "risk": 10 * i, "hr": 70, "spo2": 98} for i in range(1,7)
    ]
    return {"patients": sample}

@app.get("/scores")
def scores():
    return latest_scores
