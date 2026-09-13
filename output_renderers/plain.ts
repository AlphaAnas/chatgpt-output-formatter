import * as fs from "fs";

const OUTPUT_DIR = "OUTPUT_DIR";

export function renderOutput(
  html: string,
  outPath = "output_test.html"
): boolean {
  try {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    outPath = `${OUTPUT_DIR}/${outPath}`;

    fs.writeFileSync(outPath, html, "utf-8");

    return true;
  } catch (e) {
    console.error("Error writing output:", e);
    return false;
  }
}