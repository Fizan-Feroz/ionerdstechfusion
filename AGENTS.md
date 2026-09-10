# AGENTS.md — SynCura Project Guide for AI Agents

## Project Overview

SynCura is a **Predictive ICU Monitoring System** that uses deep learning (LSTM with attention) to predict patient deterioration risk in real-time. It combines a FastAPI backend, React/Vite frontend, and PyTorch ML pipeline trained on PhysioNet 2012 ICU data.

## Quick Commands

```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Train the ML model (with attention + early stopping + SpO2)
python ml/train.py `
  --physionet "C:\Users\fizan\Downloads\Techfusion\predicting-mortality-of-icu-patients-the-physionetcomputing-in-cardiology-challenge-2012-1.0.0\predicting-mortality-of-icu-patients-the-physionet-computing-in-cardiology-challenge-2012-1.0.0\set-a" `
  --outcomes "C:\Users\fizan\Downloads\Techfusion\predicting-mortality-of-icu-patients-the-physionetcomputing-in-cardiology-challenge-2012-1.0.0\predicting-mortality-of-icu-patients-the-physionet-computing-in-cardiology-challenge-2012-1.0.0\Outcomes-a.txt" `
  --epochs 20 --max-patients 100 --patience 5

# Run backend API
pip install -r backend\requirements.txt
uvicorn backend.app:app --reload --port 8000

# Run frontend
cd frontend
npm install
npm run dev

# Start both (Windows)
.\start-dev.ps1
```

## Directory Structure

```
PROJ/
├── ml/                          # Machine learning pipeline
│   ├── train.py                 # Main training script (early stopping, SpO2, attention)
│   ├── train_lstm.py            # LSTMModel + AttentionLSTMModel definitions
│   ├── dataset.py               # PhysioNet data loader, creates sliding windows
│   ├── preprocess.py            # Z-score normalization, NaN interpolation
│   ├── explain.py               # SHAP-based feature importance (KernelSHAP)
│   ├── eval_shap.py             # (Legacy) SHAP evaluation stub
│   ├── bench_batch.py           # Batch benchmarking
│   ├── requirements.txt         # numpy, pandas, scikit-learn, torch, shap, matplotlib
│   ├── models/                  # Saved model weights (lstm_baseline.pt)
│   └── training_runs/           # Timestamped training run outputs
│
├── backend/                     # FastAPI REST API
│   ├── app.py                   # Main API: /health, /ingest, /patients, /scores, /metrics, /explain
│   ├── inference.py             # RiskScoreEngine: loads AttentionLSTM, real-time scoring
│   ├── training.py              # TrainingManager: background training jobs
│   ├── db.py                    # SQLite database (vitals storage)
│   ├── replay.py                # PhysioNet data replay (HTTP/MQTT ingest)
│   ├── mqtt_subscriber.py       # MQTT subscriber for vital signs
│   └── requirements.txt         # fastapi, uvicorn, torch, sqlalchemy, etc.
│
├── frontend/                    # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── App.jsx              # Main shell, routing, dashboard layout
│   │   ├── simulationContext.jsx # Client-side simulation engine (12 patients)
│   │   ├── components/
│   │   │   ├── WelcomePage.jsx       # Landing page with hero
│   │   │   ├── SensorWaveform.jsx    # SVG waveform charts
│   │   │   ├── TrainingConfig.jsx    # Training configuration form
│   │   │   ├── TrainingMonitor.jsx   # Real-time training progress
│   │   │   ├── TrainingJobsList.jsx  # List of training jobs
│   │   │   ├── SimulatedDataFeed.jsx # Tabular simulated data view
│   │   │   └── ArchitecturePage.jsx  # System architecture docs
│   │   └── welcome.css
│   ├── package.json             # react, react-router-dom, axios, chart.js
│   └── index.html
│
├── discordbot/                  # Discord alert bot
├── chatbot-tele/                # Telegram chatbot
├── firmware/                    # IoT firmware (if applicable)
├── scripts/                     # Utility scripts
├── .env                         # Environment variables (secrets)
├── .env.example                 # Environment template
├── start-dev.ps1                # Start backend + frontend together
├── setup.ps1                    # Initial project setup
└── README.md                    # Project documentation
```

## Architecture

```
Patient Vitals --> [Backend /ingest] --> [SQLite DB]
                     |
                     v
            [AttentionLSTM Model]
                     |
                     v
              Risk Score (0-100)
                     |
          +----------+----------+
          |                     |
     [Frontend Dashboard]   [Discord/Telegram Alerts]
```

## ML Model Architecture

**AttentionLSTMModel** (defined in `ml/train_lstm.py`):

- Input: 6 features x 60 timesteps (HR, RespRate, Temp, SysBP, DiasBP, SpO2)
- 2-layer LSTM (hidden_size=64, dropout=0.3)
- Additive attention over all time steps (interpretable)
- Batch normalization + dropout
- Sigmoid output for binary mortality prediction

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | API status |
| POST | `/ingest` | Ingest vital JSON, returns risk score |
| GET | `/patients` | Top 6 patients by risk score |
| GET | `/patient/{id}` | Patient details + recent vitals |
| GET | `/scores` | All live risk scores |
| GET | `/metrics` | Latest training metrics (AUC, accuracy, recall) |
| GET | `/patient/{id}/explain` | SHAP feature importance + attention weights |
| POST | `/training/start` | Start a new training job |
| GET | `/training/jobs` | List all training jobs |
| GET | `/training/{id}/progress` | Stream training progress (NDJSON) |

## Feature Set

The model uses 6 features (must match between training and inference):

| Feature | PhysioNet Name | Normal Range |
|---------|---------------|--------------|
| Heart Rate | HR | 60-100 bpm |
| Respiratory Rate | RespRate | 12-20 /min |
| Temperature | Temp | 36.1-37.2 C |
| Systolic BP | NISysABP | 90-140 mmHg |
| Diastolic BP | NIDiasABP | 60-90 mmHg |
| SpO2 | SpO2 | 95-100% |

## Code Conventions

- **Python**: Follow existing style, no comments unless complex logic
- **JavaScript/JSX**: React functional components with hooks, Tailwind CSS classes
- **No new dependencies** without checking existing ones first
- **Model compatibility**: Always update both `train.py` AND `inference.py` when changing features/architecture
- **Thread safety**: RiskScoreEngine uses `threading.Lock()` for concurrent access

## Testing

```powershell
# Smoke test the model (random data)
python ml/train_lstm.py

# Test backend starts
uvicorn backend.app:app --port 8000
curl http://localhost:8000/health

# Test ingestion
curl -X POST http://localhost:8000/ingest -H "Content-Type: application/json" -d '{"patient_id":"test","timestamp":1,"HR":85,"SpO2":98,"RespRate":16,"Temp":37,"NISysABP":120,"NIDiasABP":80}'
```

## Known Issues

- Frontend simulation is client-side only (does not read back from backend)
- Model stats in frontend WelcomePage may still be hardcoded (check before modifying)
- `chart.js` and `socket.io-client` are in package.json but unused
- No unit tests exist yet
