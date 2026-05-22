import AddStudentForm from "./AddStudentForm";
import { FACULTIES, FACULTY_COURSES } from "@/lib/courses";

export default async function AddStudentPage() {
  const faculties = FACULTIES;
  const courses = FACULTY_COURSES;

  const semesters = ["1", "2", "3", "4", "5", "6"];
  const today = new Date().toISOString().split("T")[0];

  return (
    <AddStudentForm
      faculties={faculties}
      courses={courses}
      semesters={semesters}
      today={today}
    />
  );
}
