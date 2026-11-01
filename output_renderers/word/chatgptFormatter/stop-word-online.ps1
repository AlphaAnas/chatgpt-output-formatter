# Stops the ChatGPT Formatter add-in session in Word Online.
#
# Pass -Local to stop the session started with start-word-online.ps1 -Local.

param(
    [switch]$Local
)

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path

if ($Local) {
    $manifestPath = Join-Path $scriptDirectory "manifest.local.generated.xml"
    if (-not (Test-Path $manifestPath)) {
        throw "Local manifest not found. Start the add-in with start-word-online.ps1 -Local first."
    }
    Write-Host "Stopping the local add-in session"
} else {
    $manifestPath = Join-Path $scriptDirectory "manifest.xml"
    Write-Host "Stopping the hosted add-in session"
}

Push-Location $scriptDirectory
try {
    npx office-addin-debugging stop $manifestPath
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
} finally {
    Pop-Location
}
