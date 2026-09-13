import * as fs from "fs";

export function processFiles(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err}`);
    return "";
  }
}

