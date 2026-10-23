# Local development: Modbus emulator on :5020, backend on :8000, frontend on :5173.
# The emulator is started only when port 5020 is free; existing processes are left alone.
. "$PSScriptRoot\_common.ps1"

$emulator = $null
if (-not (Get-NetTCPConnection -LocalPort 5020 -State Listen -ErrorAction SilentlyContinue)) {
    $emulator = Start-Process -FilePath $Py `
        -ArgumentList "-m", "plant_emulator" `
        -WorkingDirectory $RepoRoot -WindowStyle Hidden -PassThru
    Write-Host "Modbus emulator started (PID $($emulator.Id)) -- 127.0.0.1:5020"
} else {
    Write-Host "Modbus port 5020 is already in use; reusing the existing source"
}

$backend = Start-Process -FilePath $Py `
    -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000" `
    -WorkingDirectory (Join-Path $RepoRoot "backend") -WindowStyle Hidden -PassThru
Write-Host "backend started (PID $($backend.Id)) -- http://localhost:8000"

Push-Location (Join-Path $RepoRoot "frontend")
try {
    npm run dev
} finally {
    Pop-Location
    if (-not $backend.HasExited) {
        Write-Host "stopping backend (PID $($backend.Id))"
        Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    }
    if ($emulator -and -not $emulator.HasExited) {
        Write-Host "stopping Modbus emulator (PID $($emulator.Id))"
        Stop-Process -Id $emulator.Id -Force -ErrorAction SilentlyContinue
    }
}
