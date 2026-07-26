import { db, doc, getDoc, setDoc, collection, getDocs, updateDoc } from "./firebase";
import { Course, UserCourseProgress, CourseCertificate } from "../types/learning";
import { COURSES_CATALOG as ALL_COURSES } from "../data/learningData";
import { AcademySubscriptionState } from "./academySubscription";

const COURSES_COLLECTION = "courses";
const PROGRESS_COLLECTION = "studentProgress";
const CERTIFICATES_COLLECTION = "certificates";
const SUBSCRIPTIONS_COLLECTION = "subscriptions";
const PROJECTS_COLLECTION = "projects";

/**
 * Loads all learning courses from Firestore.
 * If empty, automatically seeds Firestore with the official courses catalog.
 */
export async function fetchCoursesFromFirebase(): Promise<Course[]> {
  try {
    const colRef = collection(db, COURSES_COLLECTION);
    const snapshot = await getDocs(colRef);
    
    if (!snapshot.empty) {
      const dbCourses: Course[] = [];
      snapshot.forEach((docSnap) => {
        dbCourses.push(docSnap.data() as Course);
      });
      // Sort by original order or id if available
      return dbCourses.length > 0 ? dbCourses : ALL_COURSES;
    }

    // Seed Firestore with official courses if collection is clean/empty
    console.log("Seeding Firestore with official JOXIQ AI Learning Academy courses...");
    for (const course of ALL_COURSES) {
      const courseDocRef = doc(db, COURSES_COLLECTION, course.id);
      await setDoc(courseDocRef, course);
    }
    return ALL_COURSES;
  } catch (err) {
    console.warn("Using offline catalog fallback for courses:", err);
    return ALL_COURSES;
  }
}

/**
 * Loads student progress from Firestore for the given user email.
 */
export async function fetchUserProgressFromFirebase(
  userEmail: string
): Promise<Record<string, UserCourseProgress>> {
  if (!userEmail) return {};
  try {
    const colRef = collection(db, PROGRESS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const progressMap: Record<string, UserCourseProgress> = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.userEmail === userEmail || data.userId === userEmail) {
        progressMap[data.courseId] = {
          courseId: data.courseId,
          completedClassIds: data.completedClassIds || [],
          quizScores: data.quizScores || {},
          lastAccessedClassId: data.lastAccessedClassId,
          enrolledAt: data.enrolledAt || Date.now(),
          lastActiveAt: data.lastActiveAt,
          streakDays: data.streakDays || 1,
          unlockedBadgeIds: data.unlockedBadgeIds || []
        };
      }
    });

    return progressMap;
  } catch (err) {
    console.warn("Failed fetching student progress from Firestore:", err);
    return {};
  }
}

/**
 * Saves or updates student progress for a course in Firestore.
 */
export async function saveUserProgressToFirebase(
  userEmail: string,
  courseId: string,
  progress: UserCourseProgress
): Promise<void> {
  if (!userEmail) return;
  try {
    const docId = `${userEmail.replace(/[^a-zA-Z0-9]/g, "_")}_${courseId}`;
    const progressRef = doc(db, PROGRESS_COLLECTION, docId);
    await setDoc(
      progressRef,
      {
        userEmail,
        userId: userEmail,
        courseId,
        completedClassIds: progress.completedClassIds || [],
        quizScores: progress.quizScores || {},
        completedPracticeTaskIds: progress.completedPracticeTaskIds || [],
        completedProjectIds: progress.completedProjectIds || [],
        lastAccessedClassId: progress.lastAccessedClassId || null,
        enrolledAt: progress.enrolledAt || Date.now(),
        lastActiveAt: Date.now(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Failed saving student progress to Firestore:", err);
  }
}

/**
 * Saves a generated certificate to Firestore.
 */
export async function saveCertificateToFirebase(certificate: CourseCertificate): Promise<void> {
  try {
    const certRef = doc(db, CERTIFICATES_COLLECTION, certificate.certificateId);
    await setDoc(certRef, {
      ...certificate,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed saving certificate to Firestore:", err);
  }
}

/**
 * Fetches all certificates earned by a user from Firestore.
 */
export async function fetchCertificatesFromFirebase(userEmail: string): Promise<CourseCertificate[]> {
  if (!userEmail) return [];
  try {
    const colRef = collection(db, CERTIFICATES_COLLECTION);
    const snapshot = await getDocs(colRef);
    const certificates: CourseCertificate[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.userEmail === userEmail || data.studentName === userEmail) {
        certificates.push(data as CourseCertificate);
      }
    });

    return certificates;
  } catch (err) {
    console.warn("Failed fetching certificates from Firestore:", err);
    return [];
  }
}

/**
 * Saves subscription state to Firestore.
 */
export async function saveSubscriptionToFirebase(
  userEmail: string,
  subState: AcademySubscriptionState
): Promise<void> {
  if (!userEmail) return;
  try {
    const docId = userEmail.replace(/[^a-zA-Z0-9]/g, "_");
    const subRef = doc(db, SUBSCRIPTIONS_COLLECTION, docId);
    await setDoc(subRef, {
      ...subState,
      userEmail,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed saving subscription to Firestore:", err);
  }
}

/**
 * Loads subscription state from Firestore.
 */
export async function fetchSubscriptionFromFirebase(
  userEmail: string
): Promise<AcademySubscriptionState | null> {
  if (!userEmail) return null;
  try {
    const docId = userEmail.replace(/[^a-zA-Z0-9]/g, "_");
    const subRef = doc(db, SUBSCRIPTIONS_COLLECTION, docId);
    const snap = await getDoc(subRef);
    if (snap.exists()) {
      return snap.data() as AcademySubscriptionState;
    }
    return null;
  } catch (err) {
    console.warn("Failed fetching subscription from Firestore:", err);
    return null;
  }
}

/**
 * Saves project submission or completion to Firestore.
 */
export async function saveProjectToFirebase(
  userEmail: string,
  projectId: string,
  code: string,
  completed: boolean
): Promise<void> {
  if (!userEmail) return;
  try {
    const docId = `${userEmail.replace(/[^a-zA-Z0-9]/g, "_")}_${projectId}`;
    const projectRef = doc(db, PROJECTS_COLLECTION, docId);
    await setDoc(
      projectRef,
      {
        userEmail,
        projectId,
        code,
        completed,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Failed saving project to Firestore:", err);
  }
}
