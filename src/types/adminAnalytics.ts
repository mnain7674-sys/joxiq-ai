export interface AdminOverviewMetrics {
  totalStudents: number;
  activeStudentsToday: number;
  newStudentsThisWeek: number;
  totalCourses: number;
  totalLessons: number;
  totalCompletedLessons: number;
  totalCertificatesIssued: number;
  proSubscribers: number;
}

export interface CourseAnalyticsItem {
  courseId: string;
  courseTitle: string;
  category: string;
  totalEnrollments: number;
  completedStudents: number;
  averageProgressPercentage: number;
  mostViewedLessons: { classId: string; title: string; views: number }[];
  leastViewedLessons: { classId: string; title: string; views: number }[];
  averageCompletionTimeHours: number;
}

export interface LessonAnalyticsItem {
  classId: string;
  classNumber: number;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  moduleLevel: string;
  totalViews: number;
  completionRatePercentage: number;
  quizAverageScorePercentage: number;
  practiceCompletionRatePercentage: number;
  mostAskedQuestions: string[];
}

export interface StudentAnalyticsItem {
  studentId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  currentCourseId: string;
  currentCourseTitle: string;
  currentLessonId: string;
  currentLessonTitle: string;
  progressPercentage: number;
  quizPerformancePercentage: number;
  practiceCompletionPercentage: number;
  learningStreakDays: number;
  lastActiveTime: string;
  isProSubscriber: boolean;
  joinedDate: string;
}

export interface RevenueAnalyticsData {
  proSubscribers: number;
  monthlySubscriptionRevenue: number; // e.g. 14.99 * proSubscribers
  activeSubscriptions: number;
  expiredSubscriptions: number;
  monthlyGrowthPercentage: number;
  revenueHistory: { month: string; revenue: number; subscribers: number }[];
  recentTransactions: {
    id: string;
    studentName: string;
    studentEmail: string;
    planName: string;
    amount: string;
    date: string;
    status: "Paid" | "Refunded" | "Failed";
  }[];
}

export interface AIAnalyticsInsights {
  struggleLessons: {
    classId: string;
    lessonTitle: string;
    courseTitle: string;
    struggleReason: string;
    quizAvgScore: number;
  }[];
  easyLessons: {
    classId: string;
    lessonTitle: string;
    courseTitle: string;
    completionRate: number;
  }[];
  highEngagementCourses: {
    courseId: string;
    courseTitle: string;
    totalViews: number;
    avgProgress: number;
  }[];
  coursesNeedingImprovement: {
    courseId: string;
    courseTitle: string;
    dropoffRate: number;
    feedback: string;
  }[];
}

export interface AdminAIRecommendations {
  lessonsToUpdate: {
    classId: string;
    lessonTitle: string;
    courseTitle: string;
    recommendation: string;
  }[];
  coursesToExpand: {
    courseId: string;
    courseTitle: string;
    reason: string;
  }[];
  frequentlyRequestedTopics: {
    topic: string;
    queryCount: number;
    category: string;
  }[];
  newCourseIdeas: {
    title: string;
    targetAudience: string;
    estimatedLessons: number;
    description: string;
  }[];
}

export interface FullAdminAnalytics {
  overview: AdminOverviewMetrics;
  courses: CourseAnalyticsItem[];
  lessons: LessonAnalyticsItem[];
  students: StudentAnalyticsItem[];
  revenue: RevenueAnalyticsData;
  aiInsights: AIAnalyticsInsights;
  aiRecommendations: AdminAIRecommendations;
  lastUpdatedISO: string;
}
