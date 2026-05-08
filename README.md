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

**Datasets:** downloaded and ready in `data/` (place PhysioNet / MIMIC CSVs there).

Features
--------
- Real-time ingestion (HTTP / MQTT) into `backend/data/vitals.db`.
- Sliding-window preprocessing utilities in `ml/preprocess.py`.
- LSTM training scaffold in `ml/train_lstm.py`.
- CSV replay tool `backend/replay.py` to simulate live streams.

Quick start
-----------

Backend (Windows PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
uvicorn backend.app:app --reload --port 8000
```

Simulate a live stream (HTTP ingest):

```powershell
python backend\replay.py --csv data\mimic_demo.csv --mode http --url http://localhost:8000/ingest --speed 10
```

Or publish to MQTT (requires Mosquitto):

```powershell
python backend\replay.py --csv data\mimic_demo.csv --mode mqtt --broker localhost --topic vitals
```

Developer TODOs
---------------
- [ ] Download and verify PhysioNet 2012 dataset in `data/physionet/`.
- [ ] Implement full dataset preprocessing & windowing in `ml/preprocess.py`.
- [ ] Train LSTM baseline in `ml/train_lstm.py` and save model to `ml/models/`.
- [ ] Add SHAP explainability pipeline in `ml/shap_explain.py`.
- [ ] Integrate model for real-time inference and expose risk scores.
- [ ] Build frontend SHAP waveform overlay and live sparkline updates.

Completed / In-progress
-----------------------
- [x] Project scaffold (backend, frontend, ml folders)
- [x] Basic FastAPI backend & SQLite schema (`backend/db.py`, `backend/app.py`)
- [x] Frontend mock UI (`frontend/src/App.jsx`)
- [x] CSV replay script (add `backend/replay.py`)

Where to find things
--------------------
- Backend: `backend/`
- ML: `ml/`
- Frontend: `frontend/`
- Simulation scripts: `backend/replay.py`

If you want me to run preprocessing, training, or start the backend, tell me which step to take next.
