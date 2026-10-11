# Starts the ChatGPT Formatter add-in in Word Online.
# Edit $documentUrl below to point at your own editable Word Online document.
#
# By default, this uses the hosted manifest (manifest.xml), which points to
# the deployed add-in at https://chatgpt-output-formatter-pink.vercel.app.
#
# Pass -Local to test against the local dev server instead. This generates a
# temporary manifest with that hosted base URL replaced by
# https://localhost:3000 - manifest.xml itself is never modified. Either way,
# the add-in opens in Word Online.

param(
    [switch]$Local
)

$documentUrl = "https://tpsonline-my.sharepoint.com/:w:/r/personal/m_anas_tpsonline_com/_layouts/15/doc2.aspx?sourcedoc=%7BF7206617-3268-42E6-A2D6-0903478D0EB6%7D&file=Document%208.docx&action=editNew&mobileredirect=true&wdOrigin=APPHOME-WEB.DIRECT%2CAPPHOME-WEB.BANNER.NEWBLANK&wdPreviousSession=e8e02586-71f9-4925-8bf7-51973cba846e&wdPreviousSessionSrc=AppHomeWeb&ct=1790511516299"

$hostedBaseUrl = "https://chatgpt-output-formatter-pink.vercel.app"
$localBaseUrl = "https://localhost:3000"

if ($Local) {
    $manifestPath = "manifest.local.generated.xml"
    (Get-Content "manifest.xml" -Raw).Replace($hostedBaseUrl, $localBaseUrl) |
        Set-Content $manifestPath
    Write-Host "Using local dev server manifest ($localBaseUrl)"
} else {
    $manifestPath = "manifest.xml"
    Write-Host "Using hosted manifest ($hostedBaseUrl)"
}

npx office-addin-debugging stop $manifestPath
npx office-addin-debugging start $manifestPath web --app word --document "$documentUrl"
