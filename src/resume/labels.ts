import type { Config, Labels } from "./schema.ts"

const builtInLabels: Record<string, Labels> = {
  ru: {
    summary: "О себе",
    work: "Опыт работы",
    projects: "Проекты",
    skills: "Навыки",
    education: "Образование",
    languages: "Языки",
    present: "по наст. время",
  },
  en: {
    summary: "Summary",
    work: "Experience",
    projects: "Projects",
    skills: "Skills",
    education: "Education",
    languages: "Languages",
    present: "present",
  },
}

/** Built-in labels for `lang` (by its base language, English fallback) + overrides. */
export function resolveLabels({ lang, labels }: Config): Labels {
  const base = builtInLabels[lang.split("-")[0]] ?? builtInLabels.en
  return { ...base, ...labels }
}
