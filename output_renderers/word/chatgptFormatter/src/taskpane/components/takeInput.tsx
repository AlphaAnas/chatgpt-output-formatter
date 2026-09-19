/**
 * Take input from MS Word.
 *
 * If text is selected, return the selected text.
 * If nothing is selected, return the entire document text.
 */
export async function getInputText(): Promise<{
  text: string;
  hasSelection: boolean;
}> {
  return Word.run(async (context) => {
    const selection = context.document.getSelection();
    const body = context.document.body;

    selection.load("text");
    body.load("text");

    await context.sync();

    const hasSelection = selection.text.trim().length > 0;

    console.log("Selected text:", selection.text);
    console.log("Body text:", body.text);
    console.log("Has selection:", hasSelection);

    return {
      text: hasSelection ? selection.text : body.text,
      hasSelection,
    };
  });
}