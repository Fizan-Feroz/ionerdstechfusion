import sys
import time
import os

def tail(path, n=30):
    try:
        with open(path, 'rb') as f:
            f.seek(0, os.SEEK_END)
            end = f.tell()
            size = 1024
            data = b''
            while end > 0 and data.count(b'\n') <= n:
                read_size = min(size, end)
                f.seek(end - read_size)
                chunk = f.read(read_size)
                data = chunk + data
                end -= read_size
            return b'\n'.join(data.splitlines()[-n:]).decode(errors='ignore')
    except FileNotFoundError:
        return None


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python ml/show_training_progress.py <run_dir>')
        sys.exit(1)
    run_dir = sys.argv[1]
    log_path = os.path.join(run_dir, 'training.log')
    metrics_path = os.path.join(run_dir, 'metrics.json')

    print(f'== Training run: {run_dir} ==')
    print('\n-- Last log lines --\n')
    last = tail(log_path, n=50)
    if last:
        print(last)
    else:
        print('No log found yet.')

    if os.path.exists(metrics_path):
        print('\n-- Metrics --\n')
        with open(metrics_path) as f:
            print(f.read())
    else:
        print('\nMetrics not available yet.')
