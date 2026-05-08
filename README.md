# ionerdstechfusion

IONERDS ASSEMBLE!!!!!!!!!!!!!!

## INFORMATION

- FAILURE NOT ACCEPTED

Project: Predictive ICU Monitoring System (software-only)
-------------------------------------------------------

This repository contains a scaffold for a realtime ICU patient deterioration monitoring system. It includes:

- A FastAPI backend that stores incoming vitals to SQLite and exposes a simple REST API.
- A CSV/MIMIC replay tool to simulate live vitals (MQTT or HTTP ingest).
- A PyTorch LSTM training scaffold and evaluation stubs.
- A React + Vite frontend mock dashboard and small API helper.

Status
------

**Datasets:** PhysioNet 2012 Challenge downloaded at `C:\Users\fizan\Downloads\Techfusion\predicting-mortality-of-icu-patients-the-physionetcomputing-in-cardiology-challenge-2012-1.0.0\`

ML Training
-----------

Install dependencies and train the LSTM baseline:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r ml\requirements.txt
python ml\train.py `
  --physionet "C:\Users\fizan\Downloads\Techfusion\predicting-mortality-of-icu-patients-the-physionetcomputing-in-cardiology-challenge-2012-1.0.0\predicting-mortality-of-icu-patients-the-physionet-computing-in-cardiology-challenge-2012-1.0.0\set-a" `
  --outcomes "C:\Users\fizan\Downloads\Techfusion\predicting-mortality-of-icu-patients-the-physionetcomputing-in-cardiology-challenge-2012-1.0.0\predicting-mortality-of-icu-patients-the-physionet-computing-in-cardiology-challenge-2012-1.0.0\Outcomes-a.txt" `
  --max-patients 100 `
  --epochs 5
```

This loads ~100 patients, creates 60-minute sliding windows of vitals (HR, RespRate, Temp, SysBP, DiasBP), normalizes, trains an LSTM, and saves metrics to `ml/metrics.json`.

Running the Full Data Pipeline
-------------------------------

**Step 1: Start the backend API**

```powershell
pip install -r backend\requirements.txt
uvicorn backend.app:app --reload --port 8000
```

The backend will:
- Initialize SQLite database at `backend/data/vitals.db`
- Load the trained LSTM model from `ml/models/lstm_baseline.pt`
- Start listening on `http://localhost:8000`

Available endpoints:
- `GET /health` — API status
- `POST /ingest` — Accept vital JSON: `{"patient_id":"P001", "timestamp":1000, "HR":75, "RespRate":18, ...}`
- `GET /patients` — Return top 6 patients by risk score
- `GET /patient/{patient_id}` — Get patient details and recent vitals
- `GET /scores` — Get all live risk scores

**Step 2: Run the data replay (in a new terminal)**

```powershell
pip install pandas requests paho-mqtt

python backend\replay.py `
  --mode http `
  --url http://localhost:8000/ingest `
  --physionet "C:\Users\fizan\Downloads\Techfusion\predicting-mortality-of-icu-patients-the-physionetcomputing-in-cardiology-challenge-2012-1.0.0\predicting-mortality-of-icu-patients-the-physionet-computing-in-cardiology-challenge-2012-1.0.0\set-a" `
  --speed 10 `
  --max-patients 5
```

This will stream 5 patients' vitals at 10x speed into the backend. Watch the backend logs to see each vital and computed risk score.

**Step 3: Query the API (in another terminal)**

```powershell
# Get top 6 patients
curl http://localhost:8000/patients

# Get patient details
curl http://localhost:8000/patient/132539

# Get all scores
curl http://localhost:8000/scores
```

**Expected Output:**
```json
{
  "patients": [
    {"patient_id": "132539", "risk": 65, "timestamp": 3600},
    {"patient_id": "132540", "risk": 42, "timestamp": 3600}
  ]
}
```
