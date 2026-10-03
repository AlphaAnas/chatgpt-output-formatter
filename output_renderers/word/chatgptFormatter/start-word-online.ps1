# Starts the ChatGPT Formatter add-in in Word Online.
# Edit $documentUrl below to point at your own editable Word Online document.

$documentUrl = "https://tpsonline-my.sharepoint.com/:w:/r/personal/m_anas_tpsonline_com/_layouts/15/doc2.aspx?sourcedoc=%7BF7206617-3268-42E6-A2D6-0903478D0EB6%7D&file=Document%208.docx&action=editNew&mobileredirect=true&wdOrigin=APPHOME-WEB.DIRECT%2CAPPHOME-WEB.BANNER.NEWBLANK&wdPreviousSession=e8e02586-71f9-4925-8bf7-51973cba846e&wdPreviousSessionSrc=AppHomeWeb&ct=1790511516299"

npx office-addin-debugging stop manifest.xml
npx office-addin-debugging start manifest.xml web --app word --document "$documentUrl"
