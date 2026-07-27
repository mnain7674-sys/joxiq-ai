import {
  Course,
  CourseCategory
} from "../types/learning";
import { build100ClassCurriculum } from "../services/courseCurriculumService";

interface CourseBlueprint {
  id: string;
  name: string;
  category: CourseCategory;
  shortDescription: string;
  fullDescription: string;
  courseGoal: string;
  requiredLevel: string;
  icon: string;
  gradientColor: string;
  rating: number;
  enrolledCount: number;
  estimatedHours: number;
  keyTopics?: {
    beginner: string[];
    intermediate: string[];
    advanced: string[];
    extra: string[];
  };
}

export function buildCourseCurriculum(bp: CourseBlueprint): Course {
  const course = build100ClassCurriculum(
    bp.id,
    bp.name,
    bp.category,
    bp.courseGoal,
    bp.shortDescription
  );

  // Preserve custom icon & styling if specified in blueprint
  if (bp.icon) course.icon = bp.icon;
  if (bp.gradientColor) course.gradientColor = bp.gradientColor;
  if (bp.rating) course.rating = bp.rating;
  if (bp.enrolledCount) course.enrolledCount = bp.enrolledCount;
  if (bp.estimatedHours) course.estimatedHours = bp.estimatedHours;

  return course;
}
