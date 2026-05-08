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
