"""High-level training script for PhysioNet 2012 dataset.

Run:
  python ml/train.py \\
    --physionet "C:/Users/fizan/Downloads/Techfusion/predicting-mortality-of-icu-patients-the-physionetcomputing-in-cardiology-challenge-2012-1.0.0/predicting-mortality-of-icu-patients-the-physionet-computing-in-cardiology-challenge-2012-1.0.0/set-a" \\
    --outcomes "C:/Users/fizan/Downloads/Techfusion/predicting-mortality-of-icu-patients-the-physionetcomputing-in-cardiology-challenge-2012-1.0.0/predicting-mortality-of-icu-patients-the-physionet-computing-in-cardiology-challenge-2012-1.0.0/Outcomes-a.txt" \\
    --epochs 5 --max-patients 100
"""
import argparse
import os
import json
import numpy as np
import warnings
import logging
from sklearn.metrics import roc_auc_score, accuracy_score, precision_score, recall_score
import torch

from ml.dataset import load_and_create_sequences
from ml.train_lstm import train as quick_train, LSTMModel

warnings.filterwarnings('ignore')


def setup_logging(log_path):
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    logger = logging.getLogger('train')
    logger.setLevel(logging.INFO)
    # avoid duplicate handlers on repeated calls
    if not logger.handlers:
        fh = logging.FileHandler(log_path)
        fh.setLevel(logging.INFO)
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        fmt = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
        fh.setFormatter(fmt)
        ch.setFormatter(fmt)
        logger.addHandler(fh)
        logger.addHandler(ch)
    return logger


def save_model(model, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    torch.save(model.state_dict(), path)


def evaluate_model(model, X, y, batch_size=4096, device=None):
    if device is None:
        device = next(model.parameters()).device
    model.eval()
    probs_batches = []
    with torch.no_grad():
        for start in range(0, len(X), batch_size):
            xb = torch.tensor(X[start:start + batch_size], dtype=torch.float32).to(device)
            probs_batches.append(model(xb).detach().cpu().numpy())
    probs = np.concatenate(probs_batches)
    auc = roc_auc_score(y, probs) if len(np.unique(y)) > 1 else float('nan')
    preds = (probs > 0.5).astype(int)
    acc = accuracy_score(y, preds)
    prec = precision_score(y, preds, zero_division=0)
    rec = recall_score(y, preds, zero_division=0)
    return {'auc': float(auc), 'accuracy': float(acc), 'precision': float(prec), 'recall': float(rec)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--physionet', required=True, help='Path to PhysioNet set-a/b/c directory')
    parser.add_argument('--outcomes', required=True, help='Path to Outcomes-a.txt/b.txt/c.txt file')
    parser.add_argument('--vital-features', nargs='+', default=['HR', 'RespRate', 'Temp', 'NISysABP', 'NIDiasABP'])
    parser.add_argument('--window', type=int, default=60, help='Window size in minutes')
    parser.add_argument('--max-patients', type=int, default=None)
    parser.add_argument('--epochs', type=int, default=5)
    parser.add_argument('--run-dir', default=None, help='Directory to store run outputs (model, logs, metrics)')
    args = parser.parse_args()

    # create a run directory if not provided
    if args.run_dir:
        run_dir = args.run_dir
    else:
        import datetime
        run_dir = os.path.join('ml', 'training_runs', 'run_' + datetime.datetime.now().strftime('%Y%m%d_%H%M%S'))

    os.makedirs(run_dir, exist_ok=True)
    log_path = os.path.join(run_dir, 'training.log')
    logger = setup_logging(log_path)

    logger.info('Loading PhysioNet data...')
    X, y = load_and_create_sequences(
        physionet_dir=args.physionet,
        outcomes_file=args.outcomes,
        vital_features=args.vital_features,
        window_minutes=args.window,
        max_patients=args.max_patients
    )
    logger.info(f'Loaded X={X.shape} y={y.shape}, class distribution: {np.bincount(y)}')

    logger.info('Training LSTM...')
    # quick_train prints epoch progress; also log around it
    model = quick_train(X, y, epochs=args.epochs)

    model_path = os.path.join(run_dir, 'model.pt')
    logger.info('Saving model to %s', model_path)
    save_model(model, model_path)

    logger.info('Evaluating...')
    metrics = evaluate_model(model, X, y)
    metrics_path = os.path.join(run_dir, 'metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=2)
    logger.info('Metrics: %s', metrics)


if __name__ == '__main__':
    main()
