# ChatGPT Formatter Word Add-in

AI tools commonly generate Markdown, em dashes, separator lines, and other formatting artifacts. This utility cleans AI-generated output and formats it for use in Microsoft Word, Google Docs, emails, and other applications.

It accepts Markdown or raw text and applies a consistent document template. The Word add-in lets you format selected text directly inside Word.

The formatter is part of a larger AI chatbot project for professionals.

The default template uses:

- Headings: 16pt, bold, centered
- Paragraphs: 14pt, justified
- Font: Times New Roman

## Install

From the project root:

```powershell
cd .\output_renderers\word\chatgptFormatter
npm install
```

## FOR MS WORD OUTPUT:
```bash
cd .\output_renderers\word\chatgptFormatter
```

### Run the local server

```powershell
npm run dev-server
```

The add-in is served at:

```text
https://localhost:3000/taskpane.html
```

Keep this terminal running while testing.

### Run in Word Online

Use a Word Online document URL that you can edit:

```powershell
npx office-addin-debugging start manifest.xml web --app word --document "YOUR_WORD_ONLINE_DOCUMENT_URL"
```

For example:

```powershell
npx office-addin-debugging start manifest.xml web --app word --document "https://your-tenant.sharepoint.com/:w:/r/personal/..."
```

This starts the development server, sideloads the add-in into the document, and opens Word Online. Sign in to Microsoft 365 if prompted.

Open the add-in from Word Online, paste or select Markdown/raw text, and click **Clean & Format**.

### Run in Word Desktop

Close any existing debugging session, then run:

```powershell
npx office-addin-debugging start manifest.xml desktop --app word
```

This opens desktop Word and sideloads the add-in automatically.

### Stop debugging

```powershell
npx office-addin-debugging stop manifest.xml
```

Browser developer tools can be opened with `F12` or `Ctrl+Shift+I`. Use the **Console** tab to see formatter logs.
