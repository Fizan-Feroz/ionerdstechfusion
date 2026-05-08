from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import importlib.util
import json
import logging
from pathlib import Path
import time
try:
    from backend.db import init_db, insert_vital, get_latest_vitals, get_top_patients
    from backend.inference import get_engine
    from backend.training import training_manager
except ImportError:
    from db import init_db, insert_vital, get_latest_vitals, get_top_patients
    from inference import get_engine
    from training import training_manager

app = FastAPI()
init_db()
logger = logging.getLogger("syncura.alerts")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

inference_engine = get_engine()
ALERT_COOLDOWN_SECONDS = 300
_last_alert_sent = {}


def _load_telegram_bot_sender():
    """Load send_alert() from chatbot-tele/bot.py."""
    bot_path = Path(__file__).resolve().parents[1] / "chatbot-tele" / "bot.py"
    if not bot_path.exists():
        logger.warning("Telegram bot file not found at %s", bot_path)
        return None
    try:
        spec = importlib.util.spec_from_file_location("chatbot_tele_bot", bot_path)
        if spec is None or spec.loader is None:
            logger.warning("Unable to create module spec for %s", bot_path)
            return None
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return getattr(module, "send_alert", None)
    except Exception as exc:
        logger.warning("Failed to load Telegram bot sender: %s", exc)
        return None


telegram_send_alert = _load_telegram_bot_sender()


def _should_send_alert(patient_id: str, alert_key: str) -> bool:
    now = time.time()
    cache_key = (patient_id, alert_key)
    last_sent = _last_alert_sent.get(cache_key, 0)
    if (now - last_sent) < ALERT_COOLDOWN_SECONDS:
        return False
    _last_alert_sent[cache_key] = now
    return True


def _build_live_alerts(vital: dict, risk_score: float):
    patient_id = vital.get("patient_id", "unknown")
    alerts = []
    if risk_score >= 90:
        alerts.append(
            ("critical", f"Patient {patient_id} at {risk_score:.1f}% risk - immediate bedside review needed.")
        )
    spo2 = vital.get("SpO2")
    rr = vital.get("RespRate")
    temp = vital.get("Temp")
    if spo2 is not None and spo2 <= 88:
        alerts.append(("warning", f"Patient {patient_id} has low SpO2 ({spo2}%)."))
    if rr is not None and rr >= 30:
        alerts.append(("warning", f"Patient {patient_id} respiratory rate elevated ({rr}/min)."))
    if temp is not None and temp >= 39:
        alerts.append(("info", f"Patient {patient_id} temperature trend suggests infection ({temp} C)."))
    return alerts


def _dispatch_telegram_live_alerts(vital: dict, risk_score: float):
    if telegram_send_alert is None:
        return
    patient_id = vital.get("patient_id", "unknown")
    for level, text in _build_live_alerts(vital, risk_score):
        alert_key = f"{level}:{text}"
        if not _should_send_alert(patient_id, alert_key):
            continue
        try:
            asyncio.run(telegram_send_alert(f"🚨 [SynCura {level.upper()}] {text}"))
        except Exception as exc:
            logger.warning("Failed sending Telegram alert for %s: %s", patient_id, exc)


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


class TrainingConfig(BaseModel):
    physionet_path: str
    outcomes_path: str
    epochs: int = 5
    batch_size: int = 32
    learning_rate: float = 0.001
    max_patients: int = 100
    vital_features: list = ["HR", "RespRate", "Temp", "NISysABP", "NIDiasABP"]


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
    _dispatch_telegram_live_alerts(vital_dict, risk_score)
    
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


# ============ TRAINING ENDPOINTS ============

@app.post("/training/start")
def start_training(config: TrainingConfig):
    """Start a new training job with the provided configuration."""
    config_dict = config.dict()
    job = training_manager.create_job(config_dict)
    training_manager.start_training(job.job_id)
    return {
        "job_id": job.job_id,
        "status": job.status,
        "config": config_dict
    }


@app.get("/training/jobs")
def list_training_jobs():
    """Get all training jobs with their current status."""
    all_jobs = training_manager.get_all_jobs()
    return {
        "jobs": [job.to_dict() for job in all_jobs]
    }


@app.get("/training/{job_id}")
def get_training_job(job_id: str):
    """Get details of a specific training job."""
    job = training_manager.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return job.to_dict()


@app.get("/training/{job_id}/progress")
def get_training_progress(job_id: str):
    """Get next progress update from training job (streaming)."""
    job = training_manager.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    def progress_generator():
        while True:
            try:
                progress_update = job.progress_queue.get(timeout=5)
                yield json.dumps(progress_update) + "\n"
            except:
                # Queue empty or timeout - send current job state
                current_job = training_manager.get_job(job_id)
                if current_job:
                    yield json.dumps({
                        "status": current_job.status,
                        "current_epoch": current_job.current_epoch,
                        "total_epochs": current_job.total_epochs,
                        "metrics": current_job.metrics
                    }) + "\n"
                if current_job and current_job.status in ["completed", "failed"]:
                    break
    
    return StreamingResponse(progress_generator(), media_type="application/x-ndjson")
