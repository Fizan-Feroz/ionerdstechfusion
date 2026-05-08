# Team Setup Guide - ionerdstechfusion

## Initial Setup (Both Team Members)

### 1. Clone the Repository
```powershell
git clone git@github.com:Fizan-Feroz/ionerdstechfusion.git
cd ionerdstechfusion
```

### 2. Create Local Development Branch
```powershell
# Create your own feature branch
git checkout -b dev/your-name
git push -u origin dev/your-name
```

### 3. Backend Setup
```powershell
# Create Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend\requirements.txt
pip install -r ml\requirements.txt
```

### 4. Frontend Setup
```powershell
cd frontend
npm install
cd ..
```

### 5. Verify Installation
```powershell
# Backend health check
uvicorn backend.app:app --reload --port 8000

# In another terminal, test:
curl http://localhost:8000/health
```

## Development Workflow

### Branch Strategy
- `main` — production-ready code (protected)
- `develop` — integration branch for features
- `dev/your-name` — your personal development branch
- `feature/description` — feature branches (created from develop)

### Making Changes
```powershell
# 1. Pull latest changes
git fetch origin
git pull origin develop

# 2. Create feature branch from develop
git checkout -b feature/your-feature develop

# 3. Make your changes and commit
git add .
git commit -m "feat: clear description of changes"

# 4. Push to your feature branch
git push origin feature/your-feature

# 5. Create Pull Request on GitHub
#    - Base: develop
#    - Compare: feature/your-feature
```

### Commit Message Convention
```
feat: add new feature
fix: bug fix
docs: documentation updates
refactor: code refactoring
test: add tests
chore: maintenance
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```powershell
cp .env.example .env
```

Edit `.env` with your local settings (database paths, ports, etc.).

## Running the Full System

### Terminal 1: Backend API
```powershell
.\.venv\Scripts\Activate.ps1
uvicorn backend.app:app --reload --port 8000
```

### Terminal 2: Frontend Dev Server
```powershell
cd frontend
npm run dev
```

### Terminal 3: Data Replay (simulate patient vitals)
```powershell
.\.venv\Scripts\Activate.ps1
python backend\replay.py `
  --mode http `
  --url http://localhost:8000/ingest `
  --speed 10 `
  --max-patients 5
```

## API Endpoints

- `GET /health` — Health check
- `GET /patients` — Top 6 patients by risk
- `GET /patient/{patient_id}` — Patient details
- `GET /scores` — All risk scores
- `POST /ingest` — Ingest vital signs

## ML Model Training

```powershell
# Activate venv
.\.venv\Scripts\Activate.ps1

# Train LSTM model
python ml\train.py `
  --physionet "C:\path\to\physionet\data" `
  --outcomes "C:\path\to\outcomes.txt" `
  --max-patients 100 `
  --epochs 5

# Output: ml/models/lstm_baseline.pt
```

## Troubleshooting

### "Address already in use" on port 8000
```powershell
# Find process using port 8000
netstat -ano | findstr :8000
# Kill process
taskkill /PID <PID> /F
```

### Database locked error
```powershell
# Delete old database and let backend reinitialize
rm backend\data\vitals.db
```

### SSH key issues
Ensure SSH keys are set up and added to ssh-agent:
```powershell
ssh -T git@github.com
```

## Communication

- Use GitHub Issues for bugs and feature requests
- Use Pull Request descriptions to explain changes
- Keep commit history clean and meaningful

## Resources

- FastAPI docs: https://fastapi.tiangolo.com/
- React + Vite: https://vitejs.dev/
- PyTorch LSTM: https://pytorch.org/

Good luck with the project! 🚀
