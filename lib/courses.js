export const FACULTIES = [
  "Arts",
  "Commerce",
  "Science",
  "Management",
  "Computer Science & Application",
  "Fine Arts",
  "Education",
  "PG Diploma",
  "Design",
  "Paramedical",
  "Nursing",
  "Pharmacy",
];

export const COURSES = [
  "B.A.", "M.A.",
  "B.Com (Hons)", "M.Com",
  "B.Sc. (Bio)", "B.Sc.", "M.Sc.",
  "BBA", "BCA", "PGDCA",
  "B.Sc. Computer Science", "M.Sc. Computer Science", "M.Sc. IT",
  "BFA",
  "B.Ed",
  "M.C.MA",
  "Diploma in Fashion Designing", "Diploma in Interior Designing",
  "B.Sc. Fashion Designing", "B.Sc. Interior Designing",
  "B.Des. Fashion Design", "B.Des. Interior Design",
  "M.Des. Fashion Design", "M.Des. Interior Design",
  "PG Diploma in Fashion Designing", "PG Diploma in Interior Designing",
  "DMLT",
  "GNM",
  "D.Pharma",
];

export const SEMESTERS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
];

export const FACULTY_COURSES = {
  Arts: ["B.A.", "M.A."],
  Commerce: ["B.Com (Hons)", "M.Com"],
  Science: ["B.Sc. (Bio)", "B.Sc.", "M.Sc."],
  Management: ["BBA"],
  "Computer Science & Application": [
    "BCA", "PGDCA",
    "B.Sc. Computer Science", "M.Sc. Computer Science", "M.Sc. IT",
  ],
  "Fine Arts": ["BFA"],
  Education: ["B.Ed"],
  "PG Diploma": ["M.C.MA", "PGDCA"],
  Design: [
    "Diploma in Fashion Designing", "Diploma in Interior Designing",
    "B.Sc. Fashion Designing", "B.Sc. Interior Designing",
    "B.Des. Fashion Design", "B.Des. Interior Design",
    "M.Des. Fashion Design", "M.Des. Interior Design",
    "PG Diploma in Fashion Designing", "PG Diploma in Interior Designing",
  ],
  Paramedical: ["DMLT"],
  Nursing: ["GNM"],
  Pharmacy: ["D.Pharma"],
};

export const FEE_TYPES = [
  { value: "semester", label: "Semester Fee" },
  { value: "admission", label: "Admission Fee" },
  { value: "exam", label: "Exam Fee" },
  { value: "practical", label: "Practical Fee" },
  { value: "transport", label: "Transport Fee" },
  { value: "development", label: "Development Fee" },
  { value: "sports", label: "Sports Fee" },
  { value: "misc", label: "Miscellaneous" },
];