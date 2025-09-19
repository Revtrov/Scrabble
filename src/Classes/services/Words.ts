import { readFile } from "fs/promises";
import { resolve } from "path";
import path from "path";
import { fileURLToPath } from "url";
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const loadWordsToSet = async (filePath: string): Promise<Set<string>> => {
  const absolutePath = resolve(filePath);
  const data = await readFile(absolutePath, "utf-8");
  const wordSet = new Set<string>();
  for (const word of data.split("\n")) {
    const trimmed = word.trim();
    if (trimmed) {
      wordSet.add(trimmed);
    }
  }
  return wordSet;
};
export const wordSet = await loadWordsToSet(path.join(__dirname, "./public/CSW21.txt"));
