import type { ComponentType } from "react"

import type { SectionName } from "@/core/config-schema"

import { EducationSection } from "./education"
import { LanguagesSection } from "./languages"
import { ProjectsSection } from "./projects"
import type { SectionProps } from "./section"
import { SkillsSection } from "./skills"
import { SummarySection } from "./summary"
import { WorkSection } from "./work"

/** One component per `sections` entry of config.yaml — the type enforces it. */
export const sections: Record<SectionName, ComponentType<SectionProps>> = {
  summary: SummarySection,
  work: WorkSection,
  projects: ProjectsSection,
  skills: SkillsSection,
  education: EducationSection,
  languages: LanguagesSection,
}

export { Header } from "./header"
