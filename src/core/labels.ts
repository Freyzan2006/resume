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
    preview: "Предпросмотр",
    copy: "Копировать",
    copied: "Скопировано",
    openInNewTab: "Открыть в новой вкладке",
    close: "Закрыть",
    loadError: "Не удалось загрузить файл",
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
    preview: "Preview",
    copy: "Copy",
    copied: "Copied",
    openInNewTab: "Open in new tab",
    close: "Close",
    loadError: "Couldn’t load the file",
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
    preview: "Koʻrib chiqish",
    copy: "Nusxa olish",
    copied: "Nusxa olindi",
    openInNewTab: "Yangi oynada ochish",
    close: "Yopish",
    loadError: "Faylni yuklab boʻlmadi",
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
