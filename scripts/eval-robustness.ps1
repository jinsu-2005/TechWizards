# Offline SIM study; does not change the running detector or contact physical devices.
. "$PSScriptRoot\_common.ps1"
Push-Location (Join-Path $RepoRoot "backend")
try {
    & $Py -m eval.robustness
    if ($LASTEXITCODE -ne 0) { throw "SIM stress evaluation failed ($LASTEXITCODE)." }
} finally {
    Pop-Location
}
