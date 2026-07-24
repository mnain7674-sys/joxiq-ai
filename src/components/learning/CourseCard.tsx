import React from "react";
import { Course, UserCourseProgress } from "../../types/learning";
import {
  BookOpen,
  Clock,
  Star,
  ChevronRight,
  Play,
  BarChart3,
  CheckCircle2,
  Crown,
  Lock
} from "lucide-react";

interface CourseCardProps {
  course: Course;
  userProgress?: UserCourseProgress;
  onSelectCourse: (course: Course) => void;
  onContinueCourse?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  userProgress,
  onSelectCourse,
  onContinueCourse
}) => {
  // Calculate total classes count (100)
  const totalClasses = course.totalClasses || course.modules.reduce((acc, mod) => acc + mod.classes.length, 0);
  const completedCount = userProgress?.completedClassIds.length || 0;
  const progressPercent = totalClasses > 0 ? Math.round((completedCount / totalClasses) * 100) : 0;
  const isEnrolled = !!userProgress;

  return (
    <div
      onClick={() => onSelectCourse(course)}
      className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800/80 hover:border-violet-500/40 rounded-3xl p-5 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 flex flex-col justify-between cursor-pointer overflow-hidden"
    >
      {/* Background Subtle Gradient Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${course.gradientColor} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity duration-500 pointer-events-none`} />

      <div>
        {/* Top Header: Category & Level Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-400/90 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
            {course.category}
          </span>
          
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg border bg-amber-500/10 text-amber-300 border-amber-500/30 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">5 Free</span>
            <span className="text-slate-500">•</span>
            <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>Pro</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-violet-300 transition-colors leading-snug mb-2">
          {course.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
          {course.shortDescription}
        </p>

        {/* Goal Badge */}
        <div className="text-[11px] text-slate-300 font-medium bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 mb-4 line-clamp-1">
          <span className="text-violet-400 font-bold">Goal: </span>{course.courseGoal}
        </div>

        {/* Course Stats */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-semibold mb-4 border-t border-b border-slate-800/60 py-2.5">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{course.rating.toFixed(1)}</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 text-slate-300">
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span>{totalClasses} Classes</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{course.estimatedHours} hrs</span>
          </div>
        </div>
      </div>

      {/* Footer: Progress Bar or Start Button */}
      <div>
        {isEnrolled ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> Progress ({completedCount}/100 Classes)
              </span>
              <span className="text-xs font-mono font-extrabold text-emerald-400">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onContinueCourse) onContinueCourse(course);
                else onSelectCourse(course);
              }}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Continue Learning</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="text-[11px] font-medium text-slate-500">
              {course.enrolledCount.toLocaleString()} students enrolled
            </div>
            <span className="p-2 rounded-xl bg-violet-600/10 group-hover:bg-violet-600 text-violet-400 group-hover:text-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
