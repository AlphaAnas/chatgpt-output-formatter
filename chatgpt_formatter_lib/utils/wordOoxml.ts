import type { Block } from "./ir";

/**
 * Converts Word's own OOXML (from Word.Range.getOoxml() / Word.Body.getOoxml())
 * into the shared Block[] representation.
 *
 * Word Online auto-converts pasted Markdown into real Word paragraph styles
 * (Heading1, numbered/bulleted lists, tables) before the add-in ever sees the
 * text. By the time we read `.text`, that structure (the "#", "1.", etc.) is
 * already gone. OOXML still carries it, so we read the styles directly
 * instead of re-guessing structure from plain text.
 */

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function childrenNS(el: Element, localName: string): Element[] {
  const out: Element[] = [];
  for (let i = 0; i < el.childNodes.length; i++) {
    const node = el.childNodes[i];
    if (node.nodeType === 1) {
      const child = node as Element;
      if (child.localName === localName && child.namespaceURI === W_NS) {
        out.push(child);
      }
    }
  }
  return out;
}

function firstChildNS(el: Element | null, localName: string): Element | null {
  if (!el) return null;
  const found = childrenNS(el, localName);
  return found.length > 0 ? found[0] : null;
}

function descendantsNS(el: Element | Document, localName: string): Element[] {
  const list = el.getElementsByTagNameNS(W_NS, localName);
  const out: Element[] = [];
  for (let i = 0; i < list.length; i++) out.push(list[i]);
  return out;
}

function attrVal(el: Element | null): string | null {
  if (!el) return null;
  return el.getAttributeNS(W_NS, "val") || el.getAttribute("w:val") || el.getAttribute("val");
}

function ownAttrVal(el: Element, attrLocalName: string): string | null {
  return (
    el.getAttributeNS(W_NS, attrLocalName) ||
    el.getAttribute(`w:${attrLocalName}`) ||
    el.getAttribute(attrLocalName)
  );
}

function collectRunText(node: ChildNode, emit: (chunk: string) => void) {
  if (node.nodeType !== 1) return;
  const el = node as Element;
  if (el.namespaceURI !== W_NS) return;

  switch (el.localName) {
    case "t":
      emit(el.textContent || "");
      return;
    case "tab":
      emit("\t");
      return;
    case "br":
    case "cr":
      emit("\n");
      return;
    case "pPr":
      // Paragraph properties (style, numbering, alignment) are not text.
      return;
    case "delText":
      // Skip tracked-change deletions.
      return;
    default:
      for (let i = 0; i < el.childNodes.length; i++) {
        collectRunText(el.childNodes[i], emit);
      }
  }
}

function paragraphText(p: Element): string {
  let text = "";
  for (let i = 0; i < p.childNodes.length; i++) {
    collectRunText(p.childNodes[i], (chunk) => (text += chunk));
  }
  return text.trim();
}

function headingLevelFromStyle(styleId: string | null): number | null {
  if (!styleId) return null;
  if (/^Title$/i.test(styleId)) return 1;
  const match = /^Heading(\d)/i.exec(styleId);
  if (!match) return null;
  const level = parseInt(match[1], 10);
  return level >= 1 && level <= 6 ? level : null;
}

function getNumId(p: Element): string | null {
  const pPr = firstChildNS(p, "pPr");
  const numPr = firstChildNS(pPr, "numPr");
  return attrVal(firstChildNS(numPr, "numId"));
}

function isRunBold(r: Element): boolean {
  const rPr = firstChildNS(r, "rPr");
  const b = firstChildNS(rPr, "b");
  if (!b) return false;
  const val = attrVal(b);
  return val === null || val === "1" || val.toLowerCase() === "true";
}

/**
 * A paragraph whose ENTIRE content is bold (e.g. "**Prayer**" pasted into
 * Word Online, which keeps it as a single bold run) acts like a section
 * title rather than body text. If it ends in ":" it's a field label
 * ("To:", "Date:") that stays inline with what follows it, so only the
 * colon-less case is treated as a subheading.
 */
function isSectionTitleParagraph(p: Element, text: string): boolean {
  if (!text || text.trim().endsWith(":")) return false;
  const runs = childrenNS(p, "r").filter((r) => paragraphText(r) !== "");
  return runs.length > 0 && runs.every(isRunBold);
}

interface NumberingInfo {
  numFmtByNumId: Map<string, string>;
}

/**
 * Resolves each list's numId -> abstractNumId -> level-0 numFmt, so we can
 * tell a numbered ("decimal") list apart from a bulleted ("bullet") one.
 */
function buildNumberingInfo(doc: Document): NumberingInfo {
  const abstractFmtById = new Map<string, string>();

  for (const abstractNum of descendantsNS(doc, "abstractNum")) {
    const abstractId = ownAttrVal(abstractNum, "abstractNumId");
    const lvl0 = descendantsNS(abstractNum, "lvl").find((l) => ownAttrVal(l, "ilvl") === "0");
    const numFmt = attrVal(firstChildNS(lvl0 || null, "numFmt"));
    if (abstractId && numFmt) abstractFmtById.set(abstractId, numFmt);
  }

  const numFmtByNumId = new Map<string, string>();
  for (const num of descendantsNS(doc, "num")) {
    const numId = ownAttrVal(num, "numId");
    const abstractRef = attrVal(firstChildNS(num, "abstractNumId"));
    if (numId && abstractRef && abstractFmtById.has(abstractRef)) {
      numFmtByNumId.set(numId, abstractFmtById.get(abstractRef)!);
    }
  }

  return { numFmtByNumId };
}

function tableToBlock(tbl: Element): Block {
  const rows = descendantsNS(tbl, "tr").map((tr) =>
    descendantsNS(tr, "tc").map((tc) =>
      descendantsNS(tc, "p")
        .map(paragraphText)
        .filter(Boolean)
        .join(" ")
    )
  );

  const [headers, ...bodyRows] = rows;
  return { type: "table", headers: headers || [], rows: bodyRows };
}

export function ooxmlToBlocks(ooxml: string): Block[] {
  const doc = new DOMParser().parseFromString(ooxml, "application/xml");

  const parserError = doc.getElementsByTagName("parsererror")[0];
  if (parserError) {
    throw new Error("Failed to parse Word OOXML: " + parserError.textContent);
  }

  const body = descendantsNS(doc, "body")[0];
  if (!body) return [];

  const numbering = buildNumberingInfo(doc);
  const blocks: Block[] = [];

  let pendingListItems: string[] = [];
  let pendingListOrdered = true;

  const flushList = () => {
    if (pendingListItems.length > 0) {
      blocks.push({ type: "list", ordered: pendingListOrdered, items: pendingListItems });
      pendingListItems = [];
    }
  };

  for (let i = 0; i < body.childNodes.length; i++) {
    const node = body.childNodes[i];
    if (node.nodeType !== 1) continue;
    const el = node as Element;
    if (el.namespaceURI !== W_NS) continue;

    if (el.localName === "p") {
      const pPr = firstChildNS(el, "pPr");
      const styleId = attrVal(firstChildNS(pPr, "pStyle"));
      const headingLevel = headingLevelFromStyle(styleId);
      const text = paragraphText(el);

      if (headingLevel) {
        flushList();
        if (text) blocks.push({ type: "heading", level: headingLevel, text });
        continue;
      }

      const numId = getNumId(el);
      if (numId) {
        if (!text) continue;
        const numFmt = numbering.numFmtByNumId.get(numId);
        const ordered = numFmt ? numFmt !== "bullet" : true;

        if (pendingListItems.length > 0 && ordered !== pendingListOrdered) {
          flushList();
        }
        pendingListOrdered = ordered;
        pendingListItems.push(text);
        continue;
      }

      flushList();
      if (!text) continue;

      if (isSectionTitleParagraph(el, text)) {
        blocks.push({ type: "subheading", text });
      } else {
        blocks.push({ type: "paragraph", text });
      }
    } else if (el.localName === "tbl") {
      flushList();
      blocks.push(tableToBlock(el));
    }
  }

  flushList();
  return blocks;
}

/**
 * Quick, cheap check for whether an OOXML fragment carries Word structure
 * (heading styles, numbered/bulleted lists, or tables) worth trusting over
 * re-parsing the plain text as Markdown.
 */
export function ooxmlHasWordStructure(ooxml: string): boolean {
  if (!ooxml) return false;
  return /w:pStyle[^>]*w:val="Heading\d"/i.test(ooxml) || /w:numPr/i.test(ooxml) || /<w:tbl[ >]/i.test(ooxml);
}
