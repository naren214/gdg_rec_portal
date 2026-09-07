// ============================================================
// GDG Recruitment Portal — Shared constants
// ============================================================

// Google brand palette
export const GOOGLE_COLORS = {
  blue: "#4285F4",
  red: "#EA4335",
  yellow: "#FBBC04",
  green: "#34A853",
};

export const MAX_APPLICATIONS_PER_USER = 2;

// Official GDG VIT Chennai social and contact links.
export const LINKS = {
  instagram: "https://www.instagram.com/gdg.vitc/",
  discord: "https://discord.com/invite/67G6bg4Xeq",
  gmail: "mailto:gdgvitc@gmail.com",
  linkedin: "https://www.linkedin.com/company/gdg-vitc/",
  x: "#",
};

// Lucide icon names mapped in the department cards (kept as strings so this
// file stays dependency-light; the UI maps them to icon components).
// The 12 departments. `slug` is the stable URL id used in /join/[slug] routes.
// Colors cycle through the Google brand palette (blue / red / yellow / green).
export const DEPARTMENTS = [
  // ---- Technical (8) ----
  {
    slug: "web-dev",
    name: "Web Development",
    category: "technical",
    color: GOOGLE_COLORS.blue,
    description:
      "Designs, develops and maintains responsive, high-performance websites for club projects and events using modern web frameworks, elevating accessibility and community engagement online.",
    icon: "Globe",
  },
  {
    slug: "app-dev",
    name: "App Development",
    category: "technical",
    color: GOOGLE_COLORS.red,
    description:
      "Builds intuitive, impactful mobile applications that improve accessibility and convenience for members and event participants through functional, user-focused design.",
    icon: "Smartphone",
  },
  {
    slug: "ui-ux",
    name: "UI/UX Design",
    category: "technical",
    color: GOOGLE_COLORS.yellow,
    description:
      "Designs visually appealing, user-friendly digital interfaces with a focus on accessibility, usability and aesthetics — ensuring products feel intuitive and delightful.",
    icon: "Palette",
  },
  {
    slug: "cloud-devops",
    name: "Cloud & DevOps",
    category: "technical",
    color: GOOGLE_COLORS.green,
    description:
      "Explores cloud computing, infrastructure and automation by building scalable apps, hosting hands-on workshops and teaching containerization, CI/CD and DevOps practices.",
    icon: "Cloud",
  },
  {
    slug: "data-science",
    name: "Data Science & AI",
    category: "technical",
    color: GOOGLE_COLORS.blue,
    description:
      "Applies AI, machine learning and analytics to turn data into actionable insights — solving problems, building predictive models and inspiring innovation across projects.",
    icon: "BrainCircuit",
  },
  {
    slug: "competitive-programming",
    name: "Competitive Programming",
    category: "technical",
    color: GOOGLE_COLORS.red,
    description:
      "Sharpens problem-solving through coding contests, hackathons and peer learning — building strong algorithms, logic and efficiency for real-world engineering challenges.",
    icon: "Code2",
  },
  {
    slug: "game-dev",
    name: "Game Development",
    category: "technical",
    color: GOOGLE_COLORS.yellow,
    description:
      "Combines creativity and technical skill to design engaging games, giving members hands-on experience with real-world engines, tools and production workflows.",
    icon: "Gamepad2",
  },
  {
    slug: "blockchain",
    name: "Blockchain & Web3",
    category: "technical",
    color: GOOGLE_COLORS.green,
    description:
      "Explores decentralized apps, smart contracts and Web3 development, giving members hands-on experience with modern blockchain protocols and tooling.",
    icon: "Blocks",
  },
  // ---- Non-technical (4) ----
  {
    slug: "design",
    name: "Design",
    category: "non-technical",
    color: GOOGLE_COLORS.blue,
    description:
      "Creates stunning visuals, posters and branding that capture the club's identity — making sure every design communicates creativity, professionalism and excitement.",
    icon: "PenTool",
  },
  {
    slug: "outreach",
    name: "Outreach",
    category: "non-technical",
    color: GOOGLE_COLORS.red,
    description:
      "Builds partnerships and expands reach by connecting with communities, sponsors and collaborators — unlocking diverse opportunities and impactful collaborations.",
    icon: "Handshake",
  },
  {
    slug: "publicity",
    name: "Publicity & Media",
    category: "non-technical",
    color: GOOGLE_COLORS.yellow,
    description:
      "Drives online presence with creative campaigns, video editing and storytelling — boosting engagement, promoting events and showcasing the club to the world.",
    icon: "Megaphone",
  },
  {
    slug: "management",
    name: "Management",
    category: "non-technical",
    color: GOOGLE_COLORS.green,
    description:
      "The backbone of the club — turning vision into reality by planning, executing and improvising. Oversees events, operations and growth for smooth, successful experiences.",
    icon: "Users",
  },
];

// Convenience lookup map keyed by slug.
export const DEPARTMENTS_BY_SLUG = Object.fromEntries(
  DEPARTMENTS.map((dept) => [dept.slug, dept])
);

export const getDepartmentBySlug = (slug) =>
  DEPARTMENTS.find((dept) => dept.slug === slug) || null;

// ============================================================
// Common questionnaire shared by every department.
// `id` is a stable machine key; `label` is the human prompt.
// ============================================================
export const COMMON_QUESTIONS = [
  {
    id: "whyJoin",
    label: "What makes you want to join GDG on Campus?",
    type: "long-text",
    placeholder:
      "Your perspective matters. A few thoughtful sentences are enough.",
    required: true,
  },
  {
    id: "githubUrl",
    label: "Share your GitHub profile or project link, if you have one.",
    type: "url",
    placeholder: "https://github.com/yourname",
    required: false,
  },
  {
    id: "linkedinUrl",
    label: "Share your LinkedIn profile link, if you have one.",
    type: "url",
    placeholder: "https://linkedin.com/in/yourname",
    required: false,
  },
];

// Department questionnaire. These questions are shared in structure but the
// department name is injected into the first two prompts. The IDs are stable
// so response storage never depends on editable question text.
export const DEPARTMENT_QUESTION_TEMPLATES = [
  {
    id: "interest",
    label: (departmentName) =>
      `What interests you most about ${departmentName}, and what would you like to learn?`,
    type: "long-text",
    placeholder: "A few thoughtful sentences are enough. Beginners are welcome.",
    required: true,
  },
  {
    id: "experience",
    label: (departmentName) =>
      `Tell us about a project, challenge, or idea you have explored in ${departmentName}. What did you learn?`,
    type: "long-text",
    placeholder: "A few thoughtful sentences are enough. Beginners are welcome.",
    required: true,
  },
  {
    id: "toolsSkills",
    label:
      "Which tools or skills have you tried? Tell us where you feel confident and where you are still learning.",
    type: "long-text",
    placeholder: "Be honest about what you know and what you are learning.",
    required: true,
  },
  {
    id: "problemSolving",
    label: "How would you approach a new problem when you do not know the answer yet?",
    type: "long-text",
    placeholder: "Walk us through your thinking process.",
    required: true,
  },
  {
    id: "collaboration",
    label: "Describe a time you worked with others. What was your contribution?",
    type: "long-text",
    placeholder: "It can be academic, personal or extracurricular.",
    required: true,
  },
  {
    id: "contribution",
    label: (departmentName) =>
      `What would you like to build or contribute to ${departmentName}?`,
    type: "long-text",
    placeholder: "Share an idea or two about how you would add value.",
    required: true,
  },
];

export const getDepartmentQuestions = (departmentName) =>
  DEPARTMENT_QUESTION_TEMPLATES.map((question) => ({
    ...question,
    label:
      typeof question.label === "function"
        ? question.label(departmentName)
        : question.label,
  }));

// Column headers used for the admin CSV export.
export const CSV_Header = [
  { label: "Name", key: "Name" },
  { label: "Email", key: "Email" },
  { label: "Registration Number", key: "RegistrationNumber" },
  { label: "Phone", key: "Phone" },
  { label: "Gender", key: "Gender" },
  { label: "Year of Study", key: "YearOfStudy" },
  { label: "Department", key: "Department" },
  { label: "Shortlisted", key: "shortlisted" },
  { label: "Responses", key: "Responses" },
  { label: "Department Responses", key: "DepartmentResponses" },
];

// Mailing template (placeholders #name and #dept are replaced per recipient).
export const mailingTemplate = {
  Interview:
    "<p>Hi <strong>#name</strong>,</p><p>Thank you for applying to the <strong>#dept</strong> team at Google Developer Groups! We're excited to let you know that you've been shortlisted for an interview.</p><p>We look forward to meeting you!</p>",
};
