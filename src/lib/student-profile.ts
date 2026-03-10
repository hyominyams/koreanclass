export type StudentProfile = {
  grade: string;
  classNumber: string;
  authorName: string;
  secretHash: string;
};

export const STUDENT_PROFILE_STORAGE_KEY = "student-thought-board-profile";

export const STUDENT_GRADE_OPTIONS = ["1", "2", "3", "4", "5", "6"];
export const STUDENT_CLASS_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export function buildGradeClassLabel(grade: string, classNumber: string) {
  return `${grade}학년 ${classNumber}반`;
}

export function getStudentProfileGradeClass(profile: StudentProfile) {
  return buildGradeClassLabel(profile.grade, profile.classNumber);
}

export async function hashStudentSecret(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}
