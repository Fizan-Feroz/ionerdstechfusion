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
from sklearn.metrics import roc_auc_score, accuracy_score, precision_score, recall_score
import torch

from ml.dataset import load_and_create_sequences
from ml.train_lstm import train as quick_train, LSTMModel

warnings.filterwarnings('ignore')


def save_model(model, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    torch.save(model.state_dict(), path)


def evaluate_model(model, X, y):
    model.eval()
    with torch.no_grad():
        xb = torch.tensor(X, dtype=torch.float32)
        probs = model(xb).numpy()
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
    parser.add_argument('--out', default='ml/models/lstm_baseline.pt')
    args = parser.parse_args()

    print('Loading PhysioNet data...')
    X, y = load_and_create_sequences(
        physionet_dir=args.physionet,
        outcomes_file=args.outcomes,
        vital_features=args.vital_features,
        window_minutes=args.window,
        max_patients=args.max_patients
    )
    print(f'Loaded X={X.shape} y={y.shape}, class distribution: {np.bincount(y)}')

    print('Training LSTM...')
    model = quick_train(X, y, epochs=args.epochs)

    print('Saving model...')
    save_model(model, args.out)

    print('Evaluating...')
    metrics = evaluate_model(model, X, y)
    with open('ml/metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    print('Metrics:', metrics)


if __name__ == '__main__':
    main()
