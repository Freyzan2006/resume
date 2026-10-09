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
    year: "г.",
    month: "мес.",
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
    year: "yr",
    month: "mo",
  },
  // Uzbek, Latin script: ʻ (U+02BB) in oʻ/gʻ, ʼ (U+02BC) as tutuq belgisi.
  uz: {
    summary: "Oʻzim haqimda",
    work: "Ish tajribasi",
    projects: "Loyihalar",
    skills: "Koʻnikmalar",
    education: "Taʼlim",
    certificates: "Sertifikatlar",
    languages: "Tillar",
    present: "hozirgacha",
    download: "Yuklab olish",
    year: "yil",
    month: "oy",
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
