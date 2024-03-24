import fs from "fs-extra";
import { notePath } from "./config";
import { sendToSlack } from "./client";

type Markdown = string & { readonly __markdown: unique symbol };

function readMarkdown(filepath: string): Markdown {
  return fs.readFileSync(filepath).toString() as Markdown;
}

export function send(date: Date) {
  const filepath = `${notePath}/${date.toISOString().slice(0, 10)}.md`;

  if (!fs.existsSync(filepath)) {
    console.log("NOT FOUND:", filepath);
    return;
  }

  const html = readMarkdown(filepath);
  sendToSlack(
    html
      .split("\n")
      .map((s) => (s.startsWith("```") ? "```" : s))
      .join("\n")
      .trim()
  );
}
