/**
 * Take input from MS Word.
 *
 * If text is selected, return the selected text.
 * If nothing is selected, return the entire document text.
 *
 * Also returns the matching OOXML so the caller can detect real Word
 * structure (headings, lists, tables) that Word Online may have already
 * applied before the add-in runs - by the time `.text` is read, that
 * structure can no longer be recovered from plain text alone.
 */
export interface WordInput {
  text: string;
  ooxml: string;
  hasSelection: boolean;
}

export async function getInputText(): Promise<WordInput> {
  return Word.run(async (context) => {
    const selection = context.document.getSelection();
    const body = context.document.body;

    selection.load("text");
    body.load("text");

    const selectionOoxml = selection.getOoxml();
    const bodyOoxml = body.getOoxml();

    await context.sync();

    const hasSelection = selection.text.trim().length > 0;

    return {
      text: hasSelection ? selection.text : body.text,
      ooxml: hasSelection ? selectionOoxml.value : bodyOoxml.value,
      hasSelection,
    };
  });
}
