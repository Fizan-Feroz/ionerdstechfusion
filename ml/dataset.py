"""PhysioNet 2012 dataset loader utilities.

Usage:
  from ml.dataset import load_and_create_sequences
  X, y = load_and_create_sequences(
      physionet_dir="C:/Users/fizan/Downloads/Techfusion/.../set-a",
      outcomes_file="C:/Users/fizan/Downloads/Techfusion/.../Outcomes-a.txt"
  )

PhysioNet format: CSV files per patient with columns [Time, Parameter, Value].
Expected parameters: HR, RespRate, Temp, NISysABP, NIDiasABP, NIMAP, etc.
"""
import os
import glob
import numpy as np
import pandas as pd
from ml.preprocess import normalize


def load_physionet_file(file_path, patient_outcome=None):
    """Load a single PhysioNet patient file and pivot to wide format."""
    df = pd.read_csv(file_path)
    record_id = os.path.basename(file_path).replace('.txt', '')
    df_pivot = df[df['Parameter'] != 'RecordID'].pivot_table(index='Time', columns='Parameter', values='Value')
    
    def time_to_minutes(t):
        h, m = map(int, t.split(':'))
        return h * 60 + m
    
    df_pivot.index = df_pivot.index.map(time_to_minutes)
    df_pivot = df_pivot.sort_index()
    df_pivot.index.name = 'minutes'
    
    for col in df_pivot.columns:
        df_pivot[col] = pd.to_numeric(df_pivot[col], errors='coerce')
    df_pivot = df_pivot.dropna(axis=1, how='all')
    
    return df_pivot, record_id, patient_outcome


def load_physionet_batch(physionet_dir, outcomes_file=None, max_patients=None):
    """Load all PhysioNet patient files from a directory."""
    outcomes = {}
    if outcomes_file and os.path.exists(outcomes_file):
        outcomes_df = pd.read_csv(outcomes_file)
        if {'RecordID', 'In-hospital_death'}.issubset(outcomes_df.columns):
            outcomes = dict(zip(
                outcomes_df['RecordID'].astype(str),
                outcomes_df['In-hospital_death'].astype(int)
            ))
        else:
            with open(outcomes_file, 'r') as f:
                for line in f:
                    parts = line.strip().split(',')
                    if len(parts) >= 2:
                        outcomes[parts[0]] = int(parts[1])
    
    patient_files = sorted(glob.glob(os.path.join(physionet_dir, '*.txt')))
    if max_patients:
        patient_files = patient_files[:max_patients]
    
    data = []
    for pf in patient_files:
        try:
            patient_id = os.path.basename(pf).replace('.txt', '')
            label = outcomes.get(patient_id, 0)
            df_pivot, rec_id, _ = load_physionet_file(pf, label)
            data.append((df_pivot, label, patient_id))
        except Exception as e:
            print(f'Warning: failed to load {pf}: {e}')
    
    return data


def create_sequences_from_physionet(data_list, vital_features=None, window_minutes=60):
    """Convert PhysioNet data list into sequences X, y."""
    if vital_features is None:
        vital_features = ['HR', 'RespRate', 'Temp', 'NISysABP', 'NIDiasABP']
    
    X_all = []
    y_all = []
    
    for df_pivot, label, patient_id in data_list:
        available = [f for f in vital_features if f in df_pivot.columns]
        if len(available) == 0:
            continue
        
        minute_index = range(int(df_pivot.index.min()), int(df_pivot.index.max()) + 1)
        df_vitals = df_pivot.reindex(index=minute_index, columns=vital_features)
        df_vitals = df_vitals.interpolate(method='linear', limit_direction='both')
        df_vitals = df_vitals.ffill().bfill()
        df_vitals = normalize(df_vitals).fillna(0)
        
        seq_len = window_minutes
        if len(df_vitals) < seq_len:
            continue
        
        for i in range(seq_len, len(df_vitals)):
            window = df_vitals.iloc[i-seq_len:i].values
            X_all.append(window)
            y_all.append(label)
    
    if len(X_all) == 0:
        raise ValueError('No valid sequences created from data')
    
    X = np.stack(X_all)
    y = np.array(y_all)
    return X, y


def load_and_create_sequences(physionet_dir, outcomes_file=None, vital_features=None, window_minutes=60, max_patients=None):
    """All-in-one: load PhysioNet directory and create training sequences."""
    data_list = load_physionet_batch(physionet_dir, outcomes_file, max_patients)
    X, y = create_sequences_from_physionet(data_list, vital_features, window_minutes)
    return X, y


if __name__ == '__main__':
    print('ml.dataset loaded')
