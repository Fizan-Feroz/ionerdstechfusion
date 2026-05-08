param(
  [int]$FrontendPort = 5173,
  [int]$BackendPort = 8000
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendPath = Join-Path $repoRoot "frontend"
$backendPath = Join-Path $repoRoot "backend"
$venvPython = Join-Path $repoRoot ".venv\Scripts\python.exe"
$backendPython = if (Test-Path $venvPython) { $venvPython } else { "python" }

if (!(Test-Path $frontendPath)) {
  throw "Frontend directory not found: $frontendPath"
}

if (!(Test-Path $backendPath)) {
  throw "Backend directory not found: $backendPath"
}

$backendCommand = @"
cd "$repoRoot"
$backendPython -m uvicorn backend.app:app --reload --host 127.0.0.1 --port $BackendPort
"@

$frontendCommand = @"
cd "$frontendPath"
npm run dev -- --host 127.0.0.1 --port $FrontendPort
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand | Out-Null
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand | Out-Null

Write-Host "Started backend and frontend in separate terminals."
Write-Host "Backend:  http://127.0.0.1:$BackendPort"
Write-Host "Frontend: http://127.0.0.1:$FrontendPort"
if (!(Test-Path $venvPython)) {
  Write-Host "Note: .venv not found. Backend is using global Python. If uvicorn is missing, run:"
  Write-Host "  pip install -r backend\requirements.txt"
}
