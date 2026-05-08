"""
Minimal LSTM training scaffold (PyTorch) — replace dataset loader with PhysioNet preprocessing.
"""
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import numpy as np


class SimpleLSTMDataset(Dataset):
    def __init__(self, X, y):
        self.X = X
        self.y = y

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        # Keep tensors on CPU here; move to GPU in the training loop.
        return torch.tensor(self.X[idx], dtype=torch.float32), torch.tensor(self.y[idx], dtype=torch.float32)


class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size=64, num_layers=2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)
        self.sig = nn.Sigmoid()

    def forward(self, x):
        out, _ = self.lstm(x)
        out = out[:, -1, :]
        out = self.fc(out)
        return self.sig(out).squeeze(-1)


def train(
    X,
    y,
    epochs=3,
    batch_size=32,
    learning_rate=1e-3,
    device=None,
    progress_callback=None,
):
    """Train LSTM on (X, y).

    - Uses CUDA automatically if available, unless `device` is provided.
    - Keeps DataLoader CPU-based and moves batches to device each step.
    - `progress_callback(epoch, metrics_dict)` is optional.
    """
    dataset = SimpleLSTMDataset(X, y)
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    pin = device == "cuda"
    dl = DataLoader(dataset, batch_size=batch_size, shuffle=True, pin_memory=pin)

    model = LSTMModel(input_size=X.shape[-1]).to(device)
    opt = torch.optim.Adam(model.parameters(), lr=learning_rate)
    loss_fn = nn.BCELoss()

    for e in range(epochs):
        model.train()
        total_loss = 0
        for xb, yb in dl:
            xb = xb.to(device, non_blocking=True)
            yb = yb.to(device, non_blocking=True)
            pred = model(xb)
            loss = loss_fn(pred, yb)
            opt.zero_grad()
            loss.backward()
            opt.step()
            total_loss += loss.item()

        avg_loss = total_loss / max(1, len(dl))
        metrics = {"train_loss": float(avg_loss), "device": str(device)}
        print(f"Epoch {e} loss: {avg_loss:.4f} ({device})")
        if progress_callback is not None:
            progress_callback(e + 1, metrics)

    return model


if __name__ == '__main__':
    # quick smoke test with random data
    X = np.random.randn(200, 60, 6)
    y = (np.random.rand(200) > 0.8).astype(float)
    model = train(X, y, epochs=2)
    torch.save(model.state_dict(), 'ml/lstm_baseline.pt')
    print('Saved ml/lstm_baseline.pt')
