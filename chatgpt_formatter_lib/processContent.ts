
import { normalize } from "./utils/normalize";
import { parseMarkdown } from "./utils/parser";
import { toIR } from "./utils/ir";

export function processContent(content: string) {
  let blocks_ir: any;
 

        try {
          if (content) {
            const cleanedText = normalize(content);
            if (cleanedText) {
              const formattedText = parseMarkdown(cleanedText);
              // console.log(JSON.stringify(formattedText, null, 2)); // <- add this line
              blocks_ir = toIR(formattedText);
              console.log(JSON.stringify(blocks_ir, null, 2)); // <- add this line
            }
            
          }
        } catch (e) {
          console.error("Error processing content:", e);
        }
        return blocks_ir;
      }

