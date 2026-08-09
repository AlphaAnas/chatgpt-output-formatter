import { formatContentHTML, FormatTemplate, defaultTemplate } from '../../utils/markdownFormatter';

/* global Word console */

export async function insertText(text: string) {
  // Write HTML content to the document.
  try {
    await Word.run(async (context) => {
      let body = context.document.body;
      // Use insertHtml so Word parses the HTML tags properly
      body.insertHtml(text, Word.InsertLocation.end);
      await context.sync();
    });
  } catch (error) {
    console.log("Error: " + error);
  }
}

export async function grabText(): Promise<string> {
  let grabbed = "";
  try {
    await Word.run(async (context) => {
      const body = context.document.body;
      body.load("text");
      await context.sync();
      grabbed = body.text;
      console.log("Grabbed text:", grabbed);
    });
  } catch (error) {
    console.log("Error: " + error);
  }
  return grabbed;
}
export async function clearDocument(): Promise<void> {
  try {
    await Word.run(async (context) => {
      const body = context.document.body;
      
      // Clear all content and formatting from the body
      body.clear();
      
      await context.sync();
    });
  } catch (error) {
    console.log("Error clearing document: " + error);
  }
}

export async function formatText(): Promise<string> {
  let formatted = "";
  const grabbedText = await grabText();
  console.log("Grabbed text for formatting:", grabbedText);
  // Await the formatter if it's asynchronous (remove 'await' if formatContentHTML is synchronous)
  formatted = await formatContentHTML(grabbedText);

  if (formatted){
    //remove the text on screen
    await clearDocument();
  }
  
  // Added 'await' here so insertion completes properly
  await insertText(formatted);
  
  return formatted;
}