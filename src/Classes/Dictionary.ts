import { readFile } from "fs/promises";
import { resolve } from "path";
import path from "path";
import { fileURLToPath } from "url";
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

enum Language {
  English
}

const languageFileMap = <Record<Language, string>>{
  [Language.English]: "./public/languages/english/words.txt",
}

const languageDistributionMap = <Record<Language, string>>{
  [Language.English]: "./public/languages/english/distribution.json",
}

export type DistributionEntry = { count: number; points: number };
type DistributionMap = Record<string, DistributionEntry>;

export class Dictionary {
  private static languageWordsMap: Map<Language, Set<string>> = new Map();
  private static selectedLanguage: Language;
  private static distributions: Map<string, DistributionEntry> = new Map();

  static loadDistribution = async (language: Language) => {
    const absolutePath = resolve(path.join(__dirname, languageDistributionMap[language]));
    const data = await readFile(absolutePath, "utf-8");

    const distributionJSON: DistributionMap = JSON.parse(data);
    for (const [letter, { count, points }] of Object.entries(distributionJSON)) {
      this.distributions.set(letter, { count, points });
    }
  }

  static getDistribution() {
    return this.distributions;
  }

  static fromLanguage = async (language: Language) => {
    this.languageWordsMap.set(language, new Set());
    if (!this.selectedLanguage) this.selectedLanguage = language;
    const absolutePath = resolve(path.join(__dirname, languageFileMap[language]));
    const data = await readFile(absolutePath, "utf-8");
    for (const word of data.split("\n")) {
      const trimmed = word.trim();
      if (trimmed) {
        this.languageWordsMap.get(language).add(trimmed);
      }
    }
    await this.loadDistribution(language);
  };

  static hasWord(word: string) {
    return this.languageWordsMap.get(this.selectedLanguage).has(word);
  }

  static setLanguage(language: Language) {
    this.selectedLanguage = language
  }

  static async init() {
    await Dictionary.fromLanguage(Language.English);
    Dictionary.setLanguage(Language.English)
  }

}
