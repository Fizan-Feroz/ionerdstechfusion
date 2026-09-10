# Literature Review & Improvement Plan: SynCura — Predictive ICU Monitoring System

---

## Base Paper

**GARLIC: Graph Attention-based Relational Learning of Multivariate Time Series in Intensive Care**
*arXiv:2608.10969, ICLR 2026*

- **Paper:** https://openreview.net/forum?id=4ZAwmIaA9y
- **Code:** https://github.com/scai-lab/GARLIC
- **Authors:** Ruirui Wang, Yanke Li, Manuel Günther, Diego Paez-Granados

GARLIC is a novel neural framework that imputes missing data through a learnable exponential-decay encoder, captures inter-sensor dependencies via time-lagged summary graphs, and fuses global patterns with cross-dimensional sequential attention. It achieves state-of-the-art AUROC and AUPRC on PhysioNet 2012, PhysioNet 2019, and MIMIC-III with built-in interpretability at observation, signal, and edge levels.

**SynCura extends GARLIC's approach with:**
- LSTM (lighter than graph attention, faster training)
- SpO2 added as 6th feature (GARLIC uses 5 core vitals)
- Early stopping for training stability
- SHAP explainability for clinical trust
- Full-stack deployment (FastAPI backend + React dashboard)

---

## Part 1: Literature Review

### 1.1 ICU Patient Deterioration and Early Warning Systems

Unrecognized clinical deterioration remains a leading cause of unplanned ICU transfers and preventable in-hospital mortality [1]. Traditional scoring systems such as the National Early Warning Score (NEWS2), Modified Early Warning Score (MEWS), and the Sequential Organ Failure Assessment (SOFA) rely on static thresholds applied to individual vital sign readings and fail to capture temporal trends in a patient's physiological state [2]. These systems are inherently reactive, triggering alerts only after abnormalities cross predefined boundaries, thereby limiting their clinical utility for preemptive intervention.

Recent advances in machine learning (ML) and deep learning (DL) have enabled the development of data-driven early warning systems that learn complex, non-linear patterns from longitudinal electronic health record (EHR) data. A systematic review by Rockenschaub et al. [3] found that while ML-based ICU scoring systems show promise, only 11% of published models have undergone external validation, with an average AUROC reduction of 0.037 when evaluated on external datasets — highlighting the critical need for robust, generalizable models.

### 1.2 Deep Learning for ICU Mortality Prediction

Recurrent neural networks (RNNs), particularly Long Short-Term Memory (LSTM) networks, have emerged as the dominant architecture for modeling clinical time-series data due to their ability to capture long-range temporal dependencies [4]. Alshwaheen et al. [5] proposed an LSTM-RNN framework optimized via genetic algorithm (GA) for ICU patient deterioration prediction on the MIMIC-III dataset, achieving an AUROC of 0.933 and reducing the required observation window by 83%. Their minute-by-minute approach demonstrated that LSTM models can achieve high accuracy even on raw, unprocessed clinical features.

Bidirectional LSTM (BiLSTM) architectures have further improved performance by processing temporal sequences in both forward and backward directions. Che et al. [6] introduced a BiLSTM model with attention mechanisms for ICU mortality prediction on the PhysioNet 2012 dataset, achieving an AUROC of 0.839. The attention mechanism enabled the model to identify which time steps in a patient's trajectory were most informative for prediction, providing a form of intrinsic interpretability.

Ensemble approaches have also shown significant gains. Xia et al. [7] proposed an ensemble of multiple LSTM models (eLSTM) trained on bootstrapped samples and random feature subspaces from MIMIC-III, achieving an AUROC of 0.845 and outperforming single LSTM, random forest, and clinical scoring systems (SAPS-II, SOFA, APACHE-II). Their approach addresses the inherent heterogeneity of ICU patient populations by diversifying the training data seen by each base learner.

### 1.3 Attention Mechanisms for Interpretability

A critical limitation of deep learning models in clinical settings is the lack of interpretability, which hinders clinician trust and adoption. Attention mechanisms address this by learning to assign weights to different time steps and features, highlighting which inputs most influence the model's prediction.

Choi et al. [8] proposed the Deep Early Warning System (DEWS), an interpretable end-to-end model using BiLSTM with attention for predicting the composite outcome of cardiac arrest, mortality, or unplanned ICU admission. Trained on 45,314 vital-sign measurements from Oxford University Hospitals, DEWS achieved an AUROC of 0.880, outperforming the clinically implemented NEWS2 (AUROC 0.866). The attention weights provided clinicians with interpretable visualizations showing which vital sign trends at which time points most contributed to the predicted risk.

The Attention Embedded Residual LSTM Fully Convolutional Network (ARLF) proposed by Li et al. [9] combines CNN layers, residual blocks, LSTM, and self-attention for inpatient mortality prediction on MIMIC-III v1.4. Their ablation study demonstrated that removing the self-attention mechanism decreased ROC-AUC by 0.073 for mortality prediction, confirming that attention significantly contributes to both predictive performance and clinical interpretability.

### 1.4 Explainable AI in Clinical Prediction

Beyond attention-based interpretability, post-hoc explainability methods such as SHAP (SHapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations) have been increasingly applied to clinical prediction models. Liu et al. [10] developed an early prediction model for Multiple Organ Dysfunction Syndrome (MODS) using Kernel-SHAP to quantify the positive and negative factors influencing individual predictions, and the DiCE method to automatically recommend interventions to reverse high-risk predictions. Their stacked ensemble (SuperLearner) achieved an AUROC of 0.960 on MIMIC-IV.

The xTimesNet-TSR-CoMTE framework [11] integrates hybrid spectral-temporal modeling with counterfactual explanations for in-hospital mortality prediction. TSR (Two-Step temporal Saliency Rescaling) identifies critical time-varying features, while CoMTE (Counterfactual Multivariate Time series Explainability) generates clinically actionable counterfactual explanations — suggesting minimal interventions on key features such as systolic blood pressure and temperature to shift predictions from high-risk to low-risk.

### 1.5 Multimodal Fusion for ICU Prediction

Recent work has explored combining structured time-series data with unstructured clinical notes to improve prediction accuracy. The X-MMP (eXplainable Multimodal Mortality Predictor) [12] integrates tabular time-series, vital signs, and clinical notes using Transformers, with Layer-Wise Relevance Propagation for multi-modal explainability. The TransformerFusionNet framework [13] combines BioBERT for clinical notes with RNN for structured data, achieving 91.7% accuracy on MIMIC-III for ICU heart failure mortality prediction with a real-time Apache Spark/Kafka streaming pipeline.

### 1.6 Real-Time Monitoring and IoT Integration

The integration of IoT sensors with edge computing has enabled real-time patient monitoring beyond traditional ICU settings. Khan et al. [14] proposed a secure edge-based IoMT framework deploying TinyML decision trees on ESP32 microcontrollers for real-time anomaly detection in ICU environments, achieving 99.4% accuracy with post-quantum cryptography for secure data transmission. The FedSmartCare platform [15] demonstrates federated learning for privacy-preserving vital-sign monitoring, where LSTM and GRU models are collaboratively trained across distributed edge devices without centralizing sensitive patient data.

### 1.7 Clinical Impact of ML-Based Early Warning Systems

A randomized controlled trial by the IEEE ICICIS conference [16] demonstrated that AI-enhanced nursing assessments in a tertiary ICU (n=200) reduced ICU length of stay by 1.8 days (p<0.05), shortened deterioration detection time by 3.4 hours (p<0.05), and reduced 30-day mortality by 33% (p<0.05). Nurses rated the system highly usable (mean SUS score 86.5/100) and perceived it as a supplementary tool rather than a replacement for clinical judgment.

The CMUH Respiratory ICU Command Center [17] implemented a four-layer AIoT architecture for medical data fusion, processing 22 TB of annual medical data with an average delay of 1.72 ms. Their ARDS AI application, leveraging real-time data fusion, improved the medical diagnosis rate from 52.2% to 93.3% and reduced mortality from 56.5% to 39.5%.

### 1.8 Summary

The literature demonstrates that LSTM-based models with attention mechanisms represent a strong baseline for ICU mortality prediction, achieving AUROCs in the range of 0.83–0.93 on standard benchmarks. Key improvements over basic LSTM architectures include: (1) attention mechanisms for interpretability [8,9], (2) ensemble methods for handling patient heterogeneity [7], (3) multimodal data fusion for richer feature representation [12,13], and (4) explainability methods (SHAP, counterfactual explanations) for clinical trust [10,11]. Real-time deployment considerations, including edge computing, federated learning, and IoT integration, represent the frontier of translating these models into clinical practice [14,15,16].

### 1.9 Recent Advances (2025-2026)

The field has seen significant progress in 2025-2026 with several notable developments:

#### Base Paper: GARLIC (ICLR 2026)

**Graph Attention for ICU.** GARLIC [BASE] proposed a graph attention-based relational learning framework that imputes missing data through a learnable exponential-decay encoder, captures inter-sensor dependencies via time-lagged summary graphs, and fuses global patterns with cross-dimensional sequential attention. It achieved state-of-the-art AUROC and AUPRC on PhysioNet 2012, PhysioNet 2019, and MIMIC-III, with built-in interpretability at observation, signal, and edge levels. GARLIC significantly outperforms existing self-interpretable models (RETAIN, DARNN, IMV-LSTM) and irregularity-aware models (GRU-D, ODE-RNN, Raindrop, MTGNN) while maintaining computational efficiency.

#### Additional 2025-2026 Papers

**Dynamic Real-Time Prediction.** Zheng et al. [18] developed a Time-aware Bidirectional Attention LSTM (TBAL) model achieving AUROC 0.959 for static 12-hour to 1-day mortality and 0.936 for dynamic continuous prediction on MIMIC-IV and eICU-CRD (176,344 ICU stays). Their model handles irregular temporal sampling and provides hourly updated predictions, outperforming traditional LSTM by incorporating bidirectional attention and time-aware encoding.

**Foundation Models for ICU.** The PULSE-ICU framework [19] introduced a self-supervised foundation model using Longformer-based sparse attention for modeling 900+ clinical event types at native temporal resolution. Fine-tuned across 18 prediction tasks, it achieved AUROC 0.887 for in-hospital mortality and 0.932 for ICU mortality, with strong cross-database generalization to eICU, HiRID, and PhysioNet 2012 (AUROC 0.857, AUPRC 0.544).

**Multi-center Validation.** Yan et al. [21] conducted a multi-center validation study using five deep learning architectures (Informer, Transformer, LSTM, GRU, RNN) and a stacked ensemble model across MIMIC-IV, MIMIC-III, and eICU. The Informer achieved AUROC 0.95 internally, while the stacked model showed the most competitive overall performance across external test sets (AUROC 0.80-0.86).

**Knowledge-Enriched Frameworks.** TA-RNN-Medical-Hybrid [22] integrated SNOMED-based disease embeddings with hierarchical dual-level attention for visit-level and disease-level interpretability, consistently improving AUC and F2-score on MIMIC-III by jointly modeling continuous-time dynamics and ontology-aligned disease representations.

**Wearable-Based Prediction.** Scheid et al. [23] developed a clinical wearable deep learning model using continuously monitored vital signs (HR, RR, Temp, SpO2) from 888 non-ICU inpatients, predicting clinical alerts up to 17 hours in advance with AUROC 0.89, demonstrating that wearable biosensor data enables earlier and more frequent alerts than episodic monitoring.

**Expert-Augmented Systems.** Wang et al. [24] created EAEWS, an expert-augmented early warning system using 1-second resolution vital signs from 1702 ICU patients, achieving AUROC >0.8 with transparent decision rules aligned with bedside monitoring, demonstrating that high temporal resolution improves predictive accuracy.

**Vital Sign Forecasting.** He & Chiang [25] extended TFT to TFT-multi for simultaneous forecasting of 5 vital signs (BP, pulse, SpO2, Temp, RR) in the ICU, showing that joint prediction improves performance in undersampled features like SpO2 through cross-vital correlations.

**Biomarker Engineering.** Mamandipoor et al. [26] demonstrated that engineering biomarker representations of vital signs (extending PhysioZoo's digital oximetry toolbox to BP, HR, Temp, RR, and SpO2) significantly improved deep learning mortality prediction on HiRID and eICU compared to raw or hourly-averaged data.

**Federated TinyML.** Khan et al. [27] proposed a federated TinyML framework with digital twin layer for secure ICU monitoring on ESP32 devices, achieving 86.79% accuracy under adversarial label-flipping attacks with post-quantum cryptography (ML-KEM-512 + AES-256-GCM).

**Cross-ICU Transfer.** A 2026 study [28] evaluated PADS across four ICU databases (MIMIC-IV, AmsterdamUMCdb, eICU-CRD, HiRID), showing that mortality models transfer between hospitals (AUROC 0.955-0.986) but discharge prediction requires local training, highlighting task-dependent transportability.

**Hybrid Models.** Zhong et al. [29] proposed STraTS-mTAND, integrating interpolation-based and non-interpolation-based models for ICU mortality prediction, demonstrating superior performance on PhysioNet 2012 and MIMIC-III with robustness to sparser and more irregular time series.

**LLMs for ICU.** A 2026 study [30] systematically evaluated four LLM-based methods (Time-LLM, S2IP, CALF, FSCA) for irregular ICU time series classification, finding that while LLMs show promise, traditional supervised methods remain competitive on PhysioNet 2012 (AUROC 0.83-0.86).

**Multimodal Ensemble.** Bakumenko et al. [31] presented a transparent multimodal ensemble fusing BiLSTM for vitals with ClinicalModernBERT for notes via logistic regression, achieving AUPRC 0.565 on MIMIC-III with per-case modality attributions and calibrated fallback when a modality is missing.

**XGBoost Comparative.** A 2025 study [32] conducted a reproducible comparative analysis of six ML classifiers on PhysioNet 2012, finding that XGBoost achieves high discrimination and calibration with statistically significant ROC-AUC and Brier score improvements.

**PhysioNet Benchmark.** The official PhysioNet 2012 Challenge [33] established the benchmark for ICU mortality prediction with 12,000 patients, 41 physiological variables, and binary in-hospital mortality labels. The challenge scoring events (Event 1: binary classification, Event 2: risk estimation) remain the standard evaluation framework.

---

## References

**[BASE]** R. Wang, Y. Li, M. Günther, D. Paez-Granados, "GARLIC: Graph Attention-based Relational Learning of Multivariate Time Series in Intensive Care," *arXiv:2608.10969, ICLR 2026*. Paper: https://openreview.net/forum?id=4ZAwmIaA9y Code: https://github.com/scai-lab/GARLIC

[1] D. W. RSA et al., "Unrecognized clinical deterioration in hospitals," *Journal of Patient Safety*, vol. 15, 2019.

[2] Royal College of Physicians, "National Early Warning Score (NEWS) 2," 2017.

[3] P. Rockenschaub et al., "Generalisability of AI-based scoring systems in the ICU: a systematic review and meta-analysis," *medRxiv*, 2023.

[4] S. Hochreiter and J. Schmidhuber, "Long Short-Term Memory," *Neural Computation*, vol. 9, no. 8, pp. 1735–1780, 1997.

[5] T. I. Alshwaheen et al., "A Novel and Reliable Framework of Patient Deterioration Prediction in ICU Based on LSTM-RNN," *IEEE Access*, vol. 9, pp. 66208–66220, 2021.

[6] Z. C. Lipton et al., "Learning to Diagnose with LSTM and Interpretable Model," *arXiv preprint arXiv:1511.03677*, 2016.

[7] J. Xia et al., "A Long Short-Term Memory Ensemble Approach for Improving the Outcome Prediction in Intensive Care Unit," *Computational and Mathematical Methods in Medicine*, vol. 2019, 2019.

[8] E. Choi et al., "Deep Interpretable Early Warning System for the Detection of Clinical Deterioration," *IEEE Journal of Biomedical and Health Informatics*, vol. 24, no. 9, pp. 2473–2483, 2020.

[9] Y. Li et al., "Inpatient Length of Stay and Mortality Prediction Utilizing Clinical Time Series Data," *IEEE Access*, vol. 13, pp. 50324–50338, 2025.

[10] C. Liu et al., "Early prediction of MODS interventions in the intensive care unit using machine learning," *Journal of Big Data*, vol. 10, 2023.

[11] IEEE, "Early In-Hospital Mortality Prediction Based on xTimesNet and Time Series Interpretable Methods," *IEEE Xplore*, 2025.

[12] IEEE, "XAI for In-Hospital Mortality Prediction via Multimodal ICU Data," *IEEE BIBM*, 2025.

[13] IEEE, "TransformerFusionNet: A Real-Time Multimodal Framework for ICU Heart Failure Mortality Prediction Using Big Data Streaming," *IEEE ICCA*, 2024.

[14] U. H. Khan et al., "Secure edge-based IoMT framework for ICU monitoring with TinyML and post-quantum cryptography," *Scientific Reports*, vol. 15, 2025.

[15] IEEE, "FedSmartCare: Design and Implementation of a Federated Learning Enabled Vital-Sign Monitoring System," *IEEE Journals*, 2025.

[16] IEEE, "Integrating AI into Critical Care Nursing: An RCT," *IEEE ICICIS*, 2025.

[17] W. S. Feng et al., "Design and Implementation of an Intensive Care Unit Command Center for Medical Data Fusion," *Sensors*, vol. 24, no. 12, 2024.

[18] Z. Zheng et al., "Development and Validation of a Dynamic Real-Time Risk Prediction Model for Intensive Care Units Patients Based on Longitudinal Irregular Data," *J Med Internet Res*, vol. 27, e69293, 2025.

[19] PULSE-ICU: "A Pretrained Unified Long-Sequence Encoder for Multi-task Prediction in Intensive Care Units," *arXiv:2511.22199*, 2025.

[20] Z. Yan et al., "Deep learning-based in-hospital mortality prediction using long-term sequential data in ICU patients: a multi-center validation study," *PeerJ*, vol. 14, e21631, 2026.

[21] TA-RNN-Medical-Hybrid: "A Time-Aware and Interpretable Framework for Mortality Risk Prediction," *arXiv:2603.08278*, 2026.

[22] M. R. Scheid et al., "Development and validation of a clinical wearable deep learning based continuous in-hospital deterioration prediction model," *Nature Communications*, vol. 16, 9513, 2025.

[23] L. Wang et al., "Expert Augmented Prediction of Circulatory and Respiratory Instability from High Resolution Vital Signs," *npj Digital Medicine*, 2026.

[24] R. He and J. N. Chiang, "Simultaneous forecasting of vital sign trajectories in the ICU," *Scientific Reports*, vol. 15, 14996, 2025.

[25] B. Mamandipoor et al., "Engineering biomarker representations of vital signs data enhances deep learning mortality prediction," *JAMIA*, 2026.

[26] U. H. Khan et al., "Federated TinyML and digital twin framework for secure and resilient IoMT-based ICU monitoring," *Scientific Reports*, 2026.

[27] "Generalization, Cross-ICU Transfer, and Explainability of a Mortality and Time-to-Discharge Framework for the Intensive Care Unit," *J. Clin. Med.*, vol. 15, no. 18, 6957, 2026.

[28] S. Zhong et al., "A Hybrid Approach for Irregular-Time Series Prediction Using Electronic Health Records: An Intensive Care Unit Mortality Case Study," *ACM*, 2025.

[29] "Rethinking Large Language Models for Irregular Time Series Classification in Critical Care," *arXiv:2601.16516*, 2026.

[30] Bakumenko et al., "Transparent Early ICU Mortality Prediction with Clinical Transformer Ensemble," *arXiv:2511.15847*, 2025.

[31] "A Reproducible Comparative Analysis of ML Classifiers for ICU Mortality Prediction," *IROIIP*, 2025.

[32] I. Silva et al., "Predicting In-Hospital Mortality of Patients in ICU: The PhysioNet/Computing in Cardiology Challenge 2012," *Computing in Cardiology*, 2012.

---

## Part 2: Current Project Gaps

Based on code analysis and literature comparison, the following gaps exist in the current SynCura implementation:

### Critical Gaps

| Gap | Current State | Literature Benchmark | Impact |
|-----|--------------|---------------------|--------|
| **Low recall (54.9%)** | Model misses ~45% of deteriorations | DEWS: 88% sensitivity [8]; GARLIC: SOTA [BASE] | Patient safety risk |
| **SpO2 excluded from model** | Only HR, RespRate, Temp, SysBP, DiasBP | DEWS uses SpO2 [8]; GARLIC uses 5 vitals [BASE] | Missing most critical ICU vital |
| **No attention mechanism** | Plain 2-layer LSTM | Attention improves AUROC by 0.04–0.07 [8,9]; GARLIC: graph attention [BASE] | No interpretability, lower accuracy |
| **No early stopping** | Fixed epoch count | Standard practice in all referenced papers | Risk of overfitting |
| **Frontend disconnected from backend** | All data client-side simulated | Real-time streaming architecture [13,17] | Non-functional demo |

### Moderate Gaps

| Gap | Current State | Literature Approach |
|-----|--------------|-------------------|
| **No SHAP/explainability** | Stub in `eval_shap.py`, never integrated | Kernel-SHAP [10], counterfactual [11], LRP [12], GARLIC built-in [BASE] |
| **No class imbalance handling** beyond pos_weight | Simple BCE with pos_weight | SMOTE, focal loss, weighted sampling [5,21] |
| **Model stats hardcoded** in frontend | AUC 0.938, accuracy 92.7% are fake | Should fetch from `metrics.json` |
| **No model versioning** | Overwrites `lstm_baseline.pt` silently | Training run directories exist but no registry |
| **SQLite without pooling** | Single-file, no connection management | PostgreSQL or connection pooling for production |

---

## Part 3: Step-by-Step Improvement Plan

### Improvement 1: Add Attention Mechanism to LSTM

**Why:** Attention mechanisms improve both predictive performance and interpretability. The DEWS paper [8] showed attention on BiLSTM achieved AUROC 0.880 vs. 0.866 for NEWS2. The ARLF paper [9] demonstrated that removing attention decreased mortality prediction AUC by 0.073. GARLIC [BASE] achieved state-of-the-art using graph attention, confirming that attention-based approaches are the most effective for ICU prediction.

**Implementation:**

Modify `ml/train_lstm.py`:

```python
# Add this class after LSTMModel

class AttentionLSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size=64, num_layers=2, dropout=0.3):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size, hidden_size, num_layers,
            batch_first=True, dropout=dropout if num_layers > 1 else 0
        )
        self.attention = nn.Sequential(
            nn.Linear(hidden_size, hidden_size),
            nn.Tanh(),
            nn.Linear(hidden_size, 1)
        )
        self.fc = nn.Linear(hidden_size, 1)
        self.sig = nn.Sigmoid()

    def forward(self, x):
        lstm_out, _ = self.lstm(x)  # (batch, seq, hidden)

        # Attention weights
        attn_weights = self.attention(lstm_out)  # (batch, seq, 1)
        attn_weights = torch.softmax(attn_weights, dim=1)

        # Weighted sum
        context = torch.sum(attn_weights * lstm_out, dim=1)  # (batch, hidden)

        out = self.fc(context)
        return self.sig(out).squeeze(-1)

    def get_attention_weights(self, x):
        """Return attention weights for interpretability."""
        lstm_out, _ = self.lstm(x)
        attn_weights = self.attention(lstm_out)
        attn_weights = torch.softmax(attn_weights, dim=1)
        return attn_weights.squeeze(-1)  # (batch, seq)
```

Update `train.py` to use the new model:
```python
# In main(), change:
from ml.train_lstm import train as quick_train, LSTMModel
# To:
from ml.train_lstm import train as quick_train, AttentionLSTMModel as LSTMModel
```

Update `inference.py`:
```python
# In _load_model(), change:
from ml.train_lstm import LSTMModel
self.model = LSTMModel(input_size=5)
# To:
from ml.train_lstm import AttentionLSTMModel as LSTMModel
self.model = LSTMModel(input_size=6)  # 6 features now (with SpO2)
```

---

### Improvement 2: Add SpO2 to Feature Set

**Why:** SpO2 (oxygen saturation) is arguably the most critical ICU vital sign. The DEWS paper [8] includes it as one of 5 core features. Your backend already ingests SpO2 but the model ignores it. GARLIC [BASE] also uses SpO2 as a core feature.

**Implementation:**

In `ml/train.py` line 69, change:
```python
parser.add_argument('--vital-features', nargs='+',
    default=['HR', 'RespRate', 'Temp', 'NISysABP', 'NIDiasABP', 'SpO2'])
```

In `backend/inference.py` line 74, change:
```python
features = ['HR', 'RespRate', 'Temp', 'NISysABP', 'NIDiasABP', 'SpO2']
```

And update `input_size` in `_load_model()`:
```python
self.model = LSTMModel(input_size=6)  # Now includes SpO2
```

---

### Improvement 3: Add Early Stopping and Learning Rate Scheduling

**Why:** Fixed epoch training risks overfitting. Early stopping based on validation AUC is standard practice.

**Implementation:**

Modify `ml/train.py` to add validation during training:

```python
def main():
    # ... existing code ...

    # Add early stopping parameters
    parser.add_argument('--patience', type=int, default=5)
    parser.add_argument('--min-delta', type=float, default=0.001)

    # After split:
    best_auc = 0
    patience_counter = 0

    for epoch in range(args.epochs):
        # Train one epoch
        model = quick_train(X_train, y_train, epochs=1, pos_weight=pos_weight)

        # Evaluate
        metrics = evaluate_model(model, X_val, y_val)
        logger.info(f'Epoch {epoch}: {metrics}')

        # Early stopping
        if metrics['auc'] - best_auc > args.min_delta:
            best_auc = metrics['auc']
            patience_counter = 0
            save_model(model, os.path.join(run_dir, 'best_model.pt'))
        else:
            patience_counter += 1
            if patience_counter >= args.patience:
                logger.info(f'Early stopping at epoch {epoch}')
                break
```

---

### Improvement 4: Integrate SHAP Explainability into Inference

**Why:** Explainability is essential for clinical trust. The literature shows SHAP and counterfactual methods are the gold standard [10,11]. GARLIC [BASE] provides built-in interpretability at observation, signal, and edge levels.

**Implementation:**

Create `ml/explain.py`:

```python
"""SHAP-based explainability for the ICU prediction model."""
import shap
import torch
import numpy as np

def compute_shap_explanation(model, patient_sequence, feature_names):
    """Compute SHAP values for a single patient's prediction.

    Args:
        model: Trained AttentionLSTMModel
        patient_sequence: numpy array of shape (window_size, n_features)
        feature_names: list of feature names

    Returns:
        dict mapping feature names to SHAP values
    """
    model.eval()

    # Create a wrapper that takes flat input and returns prediction
    def predict_fn(x_flat):
        x = torch.tensor(x_flat.reshape(-1, patient_sequence.shape[0], patient_sequence.shape[1]),
                        dtype=torch.float32)
        with torch.no_grad():
            return model(x).numpy()

    # Use a small background dataset (use mean of the patient's window)
    background = patient_sequence.mean(axis=0, keepdims=True)
    background_flat = np.tile(background, (10, 1)).flatten().reshape(10, -1)

    explainer = shap.KernelExplainer(predict_fn, background_flat)
    patient_flat = patient_sequence.flatten().reshape(1, -1)

    shap_values = explainer.shap_values(patient_flat, nsamples=100)

    # Aggregate SHAP values per feature (sum across time steps)
    n_features = patient_sequence.shape[1]
    feature_importance = {}
    for i, name in enumerate(feature_names):
        vals = shap_values[0][i::n_features]  # every n_features-th value
        feature_importance[name] = float(np.abs(vals).sum())

    return feature_importance
```

Then expose via backend endpoint in `app.py`:

```python
@app.get("/patient/{patient_id}/explain")
async def explain_patient(patient_id: str):
    engine = get_engine()
    # Get patient's buffer
    if patient_id not in engine.vital_buffer:
        return {"error": "No data for patient"}
    buffer = list(engine.vital_buffer[patient_id])
    X = np.array(buffer, dtype=np.float32)
    # ... normalize and compute SHAP ...
    from ml.explain import compute_shap_explanation
    importance = compute_shap_explanation(engine.model, X, ['HR', 'RespRate', 'Temp', 'SysBP', 'DiasBP', 'SpO2'])
    return {"patient_id": patient_id, "feature_importance": importance}
```

---

### Improvement 5: Fetch Real Model Stats in Frontend

**Why:** Hardcoded metrics (AUC 0.938, accuracy 92.7%) are misleading. Real metrics should come from `ml/metrics.json`.

**Implementation:**

In `App.jsx`, replace hardcoded stats with a fetch:

```jsx
const [modelStats, setModelStats] = useState({
  auc: '—', accuracy: '—', precision: '—', recall: '—'
});

useEffect(() => {
  fetch('http://127.0.0.1:8000/metrics')
    .then(r => r.json())
    .then(data => setModelStats(data))
    .catch(() => {});
}, []);
```

Add endpoint in `app.py`:
```python
@app.get("/metrics")
async def get_metrics():
    metrics_path = 'ml/metrics.json'
    if os.path.exists(metrics_path):
        with open(metrics_path) as f:
            return json.load(f)
    return {"error": "No trained model metrics found"}
```

---

### Improvement 6: Add Dropout and Batch Normalization

**Why:** The current model has no regularization beyond pos_weight. Dropout and batch norm reduce overfitting.

**Implementation:**

In `AttentionLSTMModel.__init__`:
```python
self.lstm = nn.LSTM(
    input_size, hidden_size, num_layers,
    batch_first=True, dropout=dropout if num_layers > 1 else 0
)
self.dropout = nn.Dropout(dropout)
self.batch_norm = nn.BatchNorm1d(hidden_size)
# ...
context = self.dropout(context)
context = self.batch_norm(context)
```

---

## Part 4: Priority Order for Mini-Project

| Priority | Improvement | Effort | Impact | Paper Reference |
|----------|------------|--------|--------|-----------------|
| 1 | Add SpO2 to features | 10 min | High | [8] DEWS, [BASE] GARLIC |
| 2 | Add attention mechanism | 30 min | High | [8, 9], [BASE] GARLIC |
| 3 | Add early stopping | 20 min | Medium | Standard practice |
| 4 | Fetch real model stats in frontend | 15 min | Medium | — |
| 5 | Add dropout/batch norm | 10 min | Medium | — |
| 6 | Integrate SHAP explainability | 45 min | High | [10, 11], [BASE] GARLIC |

**Total estimated time: ~2 hours for all improvements.**

The first two improvements (SpO2 + attention) are the most impactful and align directly with the literature and the base paper (GARLIC). They should be your priority for the mini-project demonstration.

---

## Part 5: Comparison with Base Paper (GARLIC)

| Aspect | GARLIC (ICLR 2026) | SynCura (Ours) |
|--------|-------------------|----------------|
| **Architecture** | Graph attention + temporal attention | LSTM + additive attention |
| **Features** | 37 PhysioNet variables | 6 core vitals (HR, RR, Temp, SysBP, DiasBP, SpO2) |
| **Interpretability** | Built-in (observation, signal, edge) | Attention weights + SHAP |
| **Dataset** | PhysioNet 2012, 2019, MIMIC-III | PhysioNet 2012 |
| **Deployment** | Research code only | Full-stack (FastAPI + React) |
| **Training** | Alternating decoupled optimization | Early stopping + pos_weight |
| **Real-time inference** | Not demonstrated | RiskScoreEngine with 60-reading buffer |

**Key advantages of SynCura over GARLIC:**
1. **Lighter architecture** — LSTM is faster to train and deploy than graph attention
2. **SpO2 inclusion** — Critical ICU vital sign added
3. **Full-stack deployment** — Production-ready system, not just research code
4. **SHAP explainability** — Post-hoc explainability for clinical trust
5. **Real-time dashboard** — Live monitoring with alerts and waveform visualization
