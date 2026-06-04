import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const students = sqliteTable("students", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  faculty: text("faculty").notNull(),
  course: text("course").notNull(),
  semester: text("semester"),
  section: text("section"),
  roll_number: text("roll_number"),
  admission_no: text("admission_no"),
  pen: text("pen"),
  scholar_no: text("scholar_no"),
  enrolment_no: text("enrolment_no"),
  photo_url: text("photo_url"),
  gender: text("gender"),
  dob: text("dob"),
  religion: text("religion"),
  caste: text("caste"),
  aadhaar: text("aadhaar"),
  address: text("address"),
  father_name: text("father_name"),
  mother_name: text("mother_name"),
  guardian_name: text("guardian_name"),
  phone: text("phone"),
  alt_phone: text("alt_phone"),
  fee_status: text("fee_status").default("pending"),
  academic_year: text("academic_year"),
  admission_date: integer("admission_date", { mode: "timestamp" }).defaultNow(),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const professors = sqliteTable("professors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  qualification: text("qualification"),
  phone: text("phone"),
  email: text("email"),
  joining_date: integer("joining_date", { mode: "timestamp" }).defaultNow(),
  designation: text("designation", {
    enum: ["assistant", "associate", "professor", "hod", "principal"],
  }).default("assistant"),
  pin: text("pin").unique(),
  photo_url: text("photo_url"),
});

export const professor_subjects = sqliteTable("professor_subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  professor_id: integer("professor_id").references(() => professors.id),
  user_id: integer("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  course: text("course").notNull(),
  semester: text("semester"),
  section: text("section"),
});

export const fees = sqliteTable("fees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  student_id: integer("student_id").references(() => students.id),
  user_id: integer("user_id").references(() => users.id),
  amount: integer("amount").notNull(),
  fee_type: text("fee_type").default("monthly"),
  academic_year: text("academic_year"),
  semester: text("semester"),
  section: text("section"),
  due_date: integer("due_date", { mode: "timestamp" }).notNull(),
  paid_date: integer("paid_date", { mode: "timestamp" }),
  status: text("status").default("pending"),
  receipt_no: text("receipt_no"),
  paid_amount: integer("paid_amount").default(0),
});

export const fee_payments = sqliteTable("fee_payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fee_id: integer("fee_id").references(() => fees.id),
  student_id: integer("student_id").references(() => students.id),
  user_id: integer("user_id").references(() => users.id),
  amount: integer("amount").notNull(),
  payment_mode: text("payment_mode").default("cash"),
  paid_date: integer("paid_date", { mode: "timestamp" }).notNull(),
  receipt_no: text("receipt_no"),
  note: text("note"),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  student_id: integer("student_id").references(() => students.id),
  user_id: integer("user_id").references(() => users.id),
  date: text("date").notNull(),
  status: text("status").notNull().default("present"),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const professor_attendance = sqliteTable("professor_attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  professor_id: integer("professor_id").references(() => professors.id),
  user_id: integer("user_id").references(() => users.id),
  date: text("date").notNull(),
  status: text("status").notNull().default("present"),
  note: text("note"),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const exams = sqliteTable("exams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  course: text("course").notNull(),
  semester: text("semester"),
  subject: text("subject").notNull(),
  exam_date: text("exam_date").notNull(),
  exam_type: text("exam_type").default("internal"),
  academic_year: text("academic_year"),
  max_marks: integer("max_marks").notNull().default(100),
  passing_marks: integer("passing_marks").notNull().default(33),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const results = sqliteTable("results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  exam_id: integer("exam_id").references(() => exams.id),
  student_id: integer("student_id").references(() => students.id),
  user_id: integer("user_id").references(() => users.id),
  marks_obtained: integer("marks_obtained").notNull(),
  grade: text("grade"),
  remarks: text("remarks"),
  academic_year: text("academic_year"),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const exam_forms = sqliteTable("exam_forms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  student_id: integer("student_id").references(() => students.id),
  user_id: integer("user_id").references(() => users.id),
  academic_year: text("academic_year").notNull(),
  semester: text("semester").notNull(),
  exam_fee_paid: integer("exam_fee_paid").default(0),
  form_status: text("form_status").default("pending"),
  submitted_date: text("submitted_date"),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const assignments = sqliteTable("assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  professor_id: integer("professor_id").references(() => professors.id),
  user_id: integer("user_id").references(() => users.id),
  faculty: text("faculty").notNull().default(""),
  course: text("course").notNull(),
  semester: text("semester"),
  subject: text("subject").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  due_date: text("due_date").notNull(),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const timetable = sqliteTable("timetable", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").references(() => users.id),
  course: text("course").notNull(),
  semester: text("semester"),
  day: text("day").notNull(),
  period: integer("period").notNull(),
  subject: text("subject").notNull(),
  professor_name: text("professor_name"),
  start_time: text("start_time").notNull(),
  end_time: text("end_time").notNull(),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const period_timings = sqliteTable("period_timings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").references(() => users.id),
  period_no: integer("period_no").notNull(),
  start_time: text("start_time").notNull(),
  end_time: text("end_time").notNull(),
  label: text("label").default("teaching"),
});

export const notices = sqliteTable("notices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").default("general"),
  priority: text("priority").default("normal"),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const certificates = sqliteTable("certificates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  student_id: integer("student_id").references(() => students.id),
  user_id: integer("user_id").references(() => users.id),
  cert_type: text("cert_type").notNull(),
  issue_date: text("issue_date").notNull(),
  serial_no: text("serial_no"),
  reason: text("reason"),
  last_course: text("last_course"),
  last_exam_passed: text("last_exam_passed"),
  conduct: text("conduct").default("Good"),
  custom_content: text("custom_content"),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const fee_concessions = sqliteTable("fee_concessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  student_id: integer("student_id").references(() => students.id),
  user_id: integer("user_id").references(() => users.id),
  reason: text("reason"),
  discount_type: text("discount_type").notNull().default("amount"),
  discount_value: integer("discount_value").notNull(),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const college_settings = sqliteTable("college_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").references(() => users.id),
  college_name: text("college_name").notNull().default("My College"),
  university_name: text("university_name"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  principal_name: text("principal_name"),
  affiliation_no: text("affiliation_no"),
  college_code: text("college_code"),
  logo_url: text("logo_url"),
  signature_url: text("signature_url"),
  updated_at: integer("updated_at", { mode: "timestamp" }).defaultNow(),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatar: text("avatar"),
  status: text("status").notNull().default("trial"),
  trial_start: integer("trial_start", { mode: "timestamp" }).defaultNow(),
  expiry_date: text("expiry_date"),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
  reminder_sent: integer("reminder_sent").default(0),
});

export const fee_packages = sqliteTable("fee_packages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").references(() => users.id),
  course: text("course").notNull(),
  semester: text("semester"),
  academic_year: text("academic_year").notNull(),
  total_amount: integer("total_amount").notNull().default(0),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
});

export const fee_package_items = sqliteTable("fee_package_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  package_id: integer("package_id").references(() => fee_packages.id),
  fee_type: text("fee_type").notNull(),
  label: text("label"),
  amount: integer("amount").notNull().default(0),
});
