Training runs directory

Each training run writes outputs into its own run directory.

Typical contents:
- `training.log` — stdout + epoch logs
- `model.pt` — saved model state dict
- `metrics.json` — evaluation metrics

Quick start (PowerShell):

```powershell
# Run training and store outputs in a new run folder
.
.venv\Scripts\python.exe ml\train.py --physionet "C:\path\to\set-a" --outcomes "C:\path\to\Outcomes-a.txt" --max-patients 100 --epochs 5 --run-dir ml\training_runs\run_local_001

# View progress
python ml\show_training_progress.py ml\training_runs\run_local_001
```
