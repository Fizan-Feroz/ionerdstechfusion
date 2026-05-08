Project scaffold created for Predictive ICU Monitoring System.

Quick start:

Backend
-------
Create a Python venv and install:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
uvicorn backend.app:app --reload --port 8000
```

Frontend
--------
From `frontend` folder:

```bash
npm install
npm run dev
```

ML
--
Create a venv, install `ml/requirements.txt`, then adapt `ml/preprocess.py` and `ml/train_lstm.py` to your downloaded PhysioNet data. See `ml/` for stubs.

MQTT
----
Install Mosquitto locally (port 1883) and run. Start `backend/mqtt_subscriber.py` to store incoming vitals into SQLite.

Hardware is out of scope for this hackathon — this project uses simulated or replayed data only.

Simulation
----------
Use the provided MIMIC replay script (or a CSV streamer) to simulate live vitals over MQTT or directly to the backend API. Example approaches:

- Run a CSV replay that publishes to MQTT topic `vitals/<patient_id>` at accelerated speed (10x).
- Or call the backend REST ingestion endpoint directly with JSON payloads.

Example CSV replay (Python): create `backend/replay.py` that reads rows and publishes via `paho-mqtt` or HTTP.
