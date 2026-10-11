flowchart TD
    A["User clicks 'Apply Formatting'\nin Word add-in"] --> B["getInputText()\nReads Word selection or full doc\nReturns: { text, ooxml, hasSelection }"]

    B --> C{"hasMarkdownSyntax(text)\nAND\nooxmlHasWordStructure(ooxml)"}

    C -->|"OOXML has structure\nAND no markdown syntax"| D["OOXML PATH\nooxmlToBlocks(ooxml)"]
    C -->|"Has markdown\nOR no Word structure"| E["MARKDOWN PATH\nprocessContent(text)"]

    D --> D1["Parse XML with DOMParser\nWalk w:body → w:p / w:tbl elements"]
    D1 --> D2["Per paragraph:\n• isSignatureText? → signature block\n• heading style? → heading block\n• has numId? → list item\n• isSignatureContinuation? → signature_line block\n• else → paragraph / subheading"]
    D2 --> IR["Block[] — Intermediate Representation\n(heading, subheading, signature,\nsignature_line, paragraph, list, table)"]

    E --> E1["normalize(text)\nFix em-dashes, curly quotes,\nnon-breaking spaces, separator lines"]
    E1 --> E2["parseMarkdown(cleanedText)\nremark + remark-gfm\n→ mdast Root (AST)"]
    E2 --> E3["toIR(ast)\nWalk top-level AST nodes\nSame signature/continuation logic"]
    E3 --> IR

    IR --> F["affidavitTemplate(blocks, settings)\nApply user settings: font, size, alignment"]
    F --> G["renderHTML(blocks, template)\nFor each block → styled HTML string\n• signature → bold, signatureAlign\n• signature_line → normal, signatureAlign\n• paragraph → bodyAlign (justify)\n• heading → headingAlign (center)"]
    G --> H["insertHtml(html, hasSelection)\nWord JS API: inserts into\nselection or replaces whole doc"]
