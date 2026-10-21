/**
 * Sections linked from the navbar, in order. Each id must match a section's `id`
 * attribute in src/sections/ and a `nav.<id>` label in the locale files.
 */
export const navSections = ['about', 'skills', 'projects', 'experience', 'contact'] as const
export type SectionId = (typeof navSections)[number]
