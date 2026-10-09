import type { Config, Labels } from "./config-schema.ts"

const builtInLabels: Record<string, Labels> = {
  ru: {
    summary: "О себе",
    work: "Опыт работы",
    projects: "Проекты",
    skills: "Навыки",
    education: "Образование",
    certificates: "Сертификаты",
    languages: "Языки",
    present: "по наст. время",
    download: "Скачать",
  },
  en: {
    summary: "Summary",
    work: "Experience",
    projects: "Projects",
    skills: "Skills",
    education: "Education",
    certificates: "Certificates",
    languages: "Languages",
    present: "present",
    download: "Download",
  },
}

/**
 * Built-in labels for `lang` (by its base language, English fallback) plus
 * the overrides from config.yaml for that language.
 */
export function resolveLabels(
  lang: string,
  config: Pick<Config, "labels">
): Labels {
  const base = builtInLabels[lang.split("-")[0]] ?? builtInLabels.en
  return { ...base, ...config.labels[lang] }
}
