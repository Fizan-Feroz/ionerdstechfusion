"""High-level training script for PhysioNet 2012 dataset.

Run:
  python ml/train.py \
    --physionet "C:/Users/fizan/Downloads/Techfusion/predicting-mortality-of-icu-patients-the-physionetcomputing-in-cardiology-challenge-2012-1.0.0/predicting-mortality-of-icu-patients-the-physionetcomputing-in-cardiology-challenge-2012-1.0.0/set-a" \
    --outcomes "C:/Users/fizan/Downloads/Techfusion/predicting-mortality-of-icu-patients-the-physionetcomputing-in-cardiology-challenge-2012-1.0.0/predicting-mortality-of-icu-patients-the-physionetcomputing-in-cardiology-challenge-2012-1.0.0/Outcomes-a.txt" \
    --epochs 20 --max-patients 100 --patience 5
"""
import argparse
import datetime
import os
import json
import shutil
import numpy as np
import logging
from sklearn.metrics import roc_auc_score, accuracy_score, precision_score, recall_score
from sklearn.model_selection import GroupShuffleSplit
import torch
from tqdm import tqdm

from ml.dataset import load_and_create_sequences
from ml.train_lstm import train as quick_train, AttentionLSTMModel


def setup_logging(log_path):
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    logger = logging.getLogger('train')
    logger.setLevel(logging.INFO)
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
        for start in tqdm(range(0, len(X), batch_size), desc='Evaluating', leave=False):
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
    parser.add_argument('--vital-features', nargs='+',
                        default=['HR', 'RespRate', 'Temp', 'NISysABP', 'NIDiasABP', 'SpO2'])
    parser.add_argument('--window', type=int, default=60, help='Window size in minutes')
    parser.add_argument('--stride', type=int, default=1, help='Minutes between consecutive windows (decorrelates windows)')
    parser.add_argument('--batch-size', type=int, default=32)
    parser.add_argument('--lr', type=float, default=1e-3, help='Adam learning rate')
    parser.add_argument('--dropout', type=float, default=None, help='Dropout rate (default: model default)')
    parser.add_argument('--weight-decay', type=float, default=0.0, help='Adam L2 regularization')
    parser.add_argument('--max-patients', type=int, default=None)
    parser.add_argument('--epochs', type=int, default=20)
    parser.add_argument('--patience', type=int, default=5, help='Early stopping patience')
    parser.add_argument('--min-delta', type=float, default=0.001, help='Min AUC improvement for early stopping')
    parser.add_argument('--run-dir', default=None, help='Directory to store run outputs (model, logs, metrics)')
    args = parser.parse_args()

    # create a run directory if not provided
    if args.run_dir:
        run_dir = args.run_dir
    else:
        run_dir = os.path.join('ml', 'training_runs', 'run_' + datetime.datetime.now().strftime('%Y%m%d_%H%M%S'))

    os.makedirs(run_dir, exist_ok=True)
    log_path = os.path.join(run_dir, 'training.log')
    logger = setup_logging(log_path)

    logger.info('Loading PhysioNet data...')
    X, y, patient_ids = load_and_create_sequences(
        physionet_dir=args.physionet,
        outcomes_file=args.outcomes,
        vital_features=args.vital_features,
        window_minutes=args.window,
        max_patients=args.max_patients,
        stride=args.stride,
    )
    logger.info(f'Loaded X={X.shape} y={y.shape}, class distribution: {np.bincount(y.astype(int))}')

    # Patient-level train/val split to prevent data leakage
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, val_idx = next(gss.split(X, y, groups=patient_ids))
    X_train, y_train = X[train_idx], y[train_idx]
    X_val, y_val = X[val_idx], y[val_idx]
    logger.info(f'Split: train={X_train.shape[0]} val={X_val.shape[0]} (patient-level)')

    # Compute pos_weight for class imbalance
    n_neg = int((y_train == 0).sum())
    n_pos = int((y_train == 1).sum())
    pos_weight = n_neg / max(1, n_pos)
    logger.info(f'Class imbalance: neg={n_neg} pos={n_pos} pos_weight={pos_weight:.2f}')

    # ---- Early stopping training loop ----
    logger.info('Training AttentionLSTM with early stopping (patience=%d)...', args.patience)
    best_auc = 0.0
    patience_counter = 0
    best_model_state = None

    epoch_bar = tqdm(range(args.epochs), desc='Training', unit='epoch')
    model, opt = None, None
    for epoch in epoch_bar:
        epoch_bar.set_postfix({'best_auc': f'{best_auc:.4f}', 'patience': f'{patience_counter}/{args.patience}'})

        # Continue training the SAME model (weights + optimizer state persist).
        model, opt = quick_train(
            X_train, y_train,
            epochs=1,
            batch_size=args.batch_size,
            learning_rate=args.lr,
            pos_weight=pos_weight,
            model_class=AttentionLSTMModel,
            model=model,
            optimizer=opt,
            dropout=args.dropout,
            weight_decay=args.weight_decay,
        )

        # Evaluate on validation set
        metrics = evaluate_model(model, X_val, y_val)
        logger.info(f'Epoch {epoch + 1} val metrics: {metrics}')

        # Check for improvement
        if metrics['auc'] - best_auc > args.min_delta:
            best_auc = metrics['auc']
            patience_counter = 0
            best_model_state = {k: v.clone() for k, v in model.state_dict().items()}
            save_model(model, os.path.join(run_dir, 'best_model.pt'))
            logger.info(f'  -> New best AUC: {best_auc:.4f} (saved)')
            epoch_bar.set_postfix({'best_auc': f'{best_auc:.4f}', 'status': 'saved!'})
        else:
            patience_counter += 1
            logger.info(f'  -> No improvement ({patience_counter}/{args.patience})')
            epoch_bar.set_postfix({'best_auc': f'{best_auc:.4f}', 'patience': f'{patience_counter}/{args.patience}'})

        if patience_counter >= args.patience:
            logger.info(f'Early stopping at epoch {epoch + 1}')
            tqdm.write(f'[Early Stopping] No improvement for {args.patience} epochs. Stopping.')
            break

    epoch_bar.close()

    # Restore best model
    if best_model_state is not None:
        model.load_state_dict(best_model_state)

    # Final evaluation
    final_metrics = evaluate_model(model, X_val, y_val)
    final_metrics['best_auc'] = best_auc
    final_metrics['epochs_trained'] = epoch + 1

    # Save final metrics
    metrics_path = os.path.join(run_dir, 'metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump(final_metrics, f, indent=2)

    # Print final summary
    tqdm.write('\n' + '=' * 50)
    tqdm.write('TRAINING COMPLETE')
    tqdm.write('=' * 50)
    tqdm.write(f'AUC-ROC:       {final_metrics["auc"]:.4f}')
    tqdm.write(f'Accuracy:      {final_metrics["accuracy"]:.4f}')
    tqdm.write(f'Precision:     {final_metrics["precision"]:.4f}')
    tqdm.write(f'Recall:        {final_metrics["recall"]:.4f}')
    tqdm.write(f'Best AUC:      {final_metrics["best_auc"]:.4f}')
    tqdm.write(f'Epochs:        {final_metrics["epochs_trained"]}/{args.epochs}')
    tqdm.write(f'Model saved:   {os.path.join(run_dir, "best_model.pt")}')
    tqdm.write(f'Metrics saved: {metrics_path}')
    tqdm.write('=' * 50)

    logger.info(f'Final validation metrics: {final_metrics}')

    # Save final model
    model_path = os.path.join(run_dir, 'model.pt')
    save_model(model, model_path)
    logger.info('Saved final model to %s', model_path)

    # Copy to default inference location
    default_model_path = 'ml/models/lstm_baseline.pt'
    os.makedirs(os.path.dirname(default_model_path), exist_ok=True)
    shutil.copy2(model_path, default_model_path)
    logger.info('Copied model to %s', default_model_path)


if __name__ == '__main__':
    main()
