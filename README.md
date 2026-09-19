AI, by default, generates text in markdown. Students, professionals, lawyers, and people pasting raw content into MS Word, Google Docs, emails, and other applications may also encounter additional content such as separator lines, em dashes, and other formatting artifacts that they have to manually remove.

This utility takes markdown input, formats it correctly, removes em dashes and other content that may resemble AI-generated text, and can return a formatted DOCX output file.

This utility is part of a bigger project for an AI chatbot designed for professionals.

## How to Run the Formatter Library

```bash
cd .\chatgpt_formatter
npm run build
node dist/main.js
```

## How to Build and Run the Microsoft Word Add-in

The project also includes a Microsoft Word Office Add-in that allows users to format AI-generated content directly inside Word.

### 1. Go to the Word Add-in

From the project root, navigate to the Word add-in directory:

```powershell
cd .\output_renderers\word\chatgptFormatter
```

### 2. Install dependencies

If this is your first time running the project:

```powershell
npm install
```

### 3. Build the project

To create a production build:

```powershell
npm run build
```

### 4. Start the development server

For local development and testing:

```powershell
npm start
```

This starts the local development server, normally at:

```text
https://localhost:3000
```

The Office Add-in manifest points Word to:

```text
https://localhost:3000/taskpane.html
```

Keep this terminal running while testing the add-in.

### 5. Test in Microsoft Word Online

To test the add-in in **Word Online**:

1. Keep the development server running with:

   ```powershell
   npm start
   ```

2. Open **Microsoft Word Online** through Microsoft 365 in your browser.

3. Open an existing document or create a new Word document.

4. Open the **Add-ins** menu.

5. Choose the option for managing or uploading your own add-in, such as **My Add-ins** or **Upload My Add-in**, depending on the Microsoft 365 interface.

6. Upload the project's:

   ```text
   manifest.xml
   ```

7. After the add-in is installed, open it from the Word **Add-ins** menu.

8. The add-in's task pane should load from:

   ```text
   https://localhost:3000/taskpane.html
   ```

### 6. Test the formatting workflow

Once the add-in is open:

1. Paste ChatGPT or Claude generated content directly into the Word document.
2. Select the text you want to clean and format.
3. Open the **ChatGPT Formatter** task pane.
4. Click **Clean & Format**.
5. The selected text will be formatted and replaced in the same location.

If no text is selected, the add-in formats the entire document.

### 7. Debugging

The add-in uses `console.log()` for debugging.

When testing in Word Online, open the browser developer tools:

```text
F12
```

or:

```text
Ctrl + Shift + I
```

Then open the **Console** tab.

You can see logs such as:

```text
Getting input from Word...
Text received: ...
Has selection: true
Formatted HTML: ...
Inserting HTML into the document...
Formatting complete.
```

Errors will appear using `console.error()`.

### 8. Stop the development server

When finished testing, return to the terminal running `npm start` and press:

```text
Ctrl + C
```

## Project Workflow

The overall workflow is:

```text
ChatGPT / Claude
        ↓
Markdown / Raw AI Output
        ↓
Microsoft Word
        ↓
Select Text
        ↓
ChatGPT Formatter Add-in
        ↓
Clean + Format
        ↓
Formatted Word Content
```

The formatter can be used as part of the larger AI chatbot system for professionals, while the Microsoft Word add-in provides a direct way to clean and format AI-generated content inside Word.
