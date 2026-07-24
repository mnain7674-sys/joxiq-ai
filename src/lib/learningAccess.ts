import { ClassItem, CourseModule, Course } from "../types/learning";

/**
 * Helper to determine if a specific class is locked for a user based on their Pro status.
 *
 * Rules:
 * - Pro Users: ALL classes unlocked
 * - Free Users: Class 1-5 in Beginner level modules are FREE.
 * - Classes 6-30 (Beginner), Intermediate, Advanced, and Extra modules are PRO LOCKED.
 */
export function isClassLocked(
  cls: ClassItem,
  module: CourseModule,
  isProUser: boolean
): boolean {
  // If user is Pro, nothing is locked
  if (isProUser) return false;

  // Free access: Class 1 to 5 of Beginner modules
  if (module.level === "Beginner" && cls.classNumber <= 5) {
    return false;
  }

  // Explicit access override check if set
  if (cls.isProOnly === false) return false;

  return true;
}

/**
 * Returns badge configuration for rendering in syllabus lists
 */
export function getClassAccessBadge(cls: ClassItem, module: CourseModule, isProUser: boolean) {
  const locked = isClassLocked(cls, module, false); // Static check for badge label
  if (!locked) {
    return {
      type: "free" as const,
      label: "FREE",
      color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    };
  }
  return {
    type: "pro" as const,
    label: "PRO",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30"
  };
}
