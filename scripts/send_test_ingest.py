import requests

vital = {
    'patient_id':'34531557',
    'timestamp':0,
    'HR':117,
    'RespRate':42,
    'Temp':36.9,
    'SpO2':82
}
try:
    r = requests.post('http://127.0.0.1:8000/ingest', json=vital, timeout=5)
    print('HTTP', r.status_code)
    print(r.text)
except Exception as e:
    print('ERROR', e)
