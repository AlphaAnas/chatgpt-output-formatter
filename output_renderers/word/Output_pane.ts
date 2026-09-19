// import { normalize } from "../utils/normalize";
// import { parseMarkdown } from "../utils/parser";
// import { toIR } from "../utils/ir";
// import { defaultTemplate } from "../utils/templates";

// Office.onReady(() => {
//   document.getElementById("format-btn")!.onclick = runFormat;
// });

// async function runFormat() {
//   await Word.run(async (context) => {
//     const body = context.document.body;
//     body.load("text");
//     await context.sync();

//     const raw = body.text;                         // 1. get pasted text out of Word
//     const cleaned = normalize(raw);                // 2. your existing pipeline
//     const ast = parseMarkdown(cleaned);
//     const blocks = toIR(ast);
//     const html = defaultTemplate(blocks);           // -> rendered HTML string

//     body.clear();
//     body.insertHtml(html, Word.InsertLocation.start); // 3. write formatted version back
//     await context.sync();
//   });
// }