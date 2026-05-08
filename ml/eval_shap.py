"""
SHAP explainability stub. Loads a trained model and prepares for waveform-level explanations.

Note: For large models and multivariate time series, prefer `shap.DeepExplainer` or model-appropriate explainer.
"""
import os
import numpy as np
import torch
import shap

from ml.train_lstm import LSTMModel


def load_model(path, input_size):
    model = LSTMModel(input_size)
    model.load_state_dict(torch.load(path, map_location='cpu'))
    model.eval()
    return model


def explain_sample(model, X_sample):
    # This is a minimal example using KernelExplainer (slow). Replace with DeepExplainer if supported.
    def f(x):
        with torch.no_grad():
            t = torch.tensor(x.reshape(-1, X_sample.shape[1], X_sample.shape[2]), dtype=torch.float32)
            return model(t).numpy()

    explainer = shap.KernelExplainer(f, np.zeros((1, X_sample.shape[1], X_sample.shape[2])))
    vals = explainer.shap_values(X_sample.reshape(X_sample.shape[0], -1))
    return vals


if __name__ == '__main__':
    print('SHAP explainability script (stub)')
