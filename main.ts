import { processFiles } from "./input_processors/plain";
import { renderOutput } from "./output_renderers/plain";
import * as templates from "./chatgpt_formatter_lib/utils/templates";
import { processContent } from "./chatgpt_formatter_lib/processContent";

const filedir = "./input_data/sample_file.md";
const inputType = "plain";
const selectedTemplate = "DEFAULT";

function main() {

        if (inputType === "plain") {
          const content = processFiles(filedir);
          const formattedContent = processContent(content);

          if (!formattedContent) {
            throw new Error(`No content could be processed from ${filedir}`);
          }

          if (selectedTemplate === "DEFAULT") {
            const output = templates.defaultTemplate(formattedContent);
            if (renderOutput(output)) console.log("ALL DONE!");
          }
        }

}

main();
