/* global Word console */

export async function insertText(text: string) {
  // Write text to the document.
  try {
    await Word.run(async (context) => {
      let body = context.document.body;
      body.insertParagraph(text, Word.InsertLocation.end);
      await context.sync();
    });
  } catch (error) {
    console.log("Error: " + error);
  }
}
export async function insertHtml(
  html: string,
  hasSelection: boolean
) {
  return Word.run(async (context) => {
    console.log("Inserting HTML into the document...");
    console.log("Has selection:", hasSelection);

    if (hasSelection) {
      const selection = context.document.getSelection();

      selection.insertHtml(
        html,
        Word.InsertLocation.replace
      );
    } else {
      const body = context.document.body;

      body.insertHtml(
        html,
        Word.InsertLocation.replace
      );
    }

    await context.sync();
  });
}