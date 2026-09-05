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

// Social / contact links (replace the "#" values with real handles)
export const LINKS = {
  instagram: "#",
  discord: "#",
  gmail: "#",
  linkedin: "#",
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
// Common questionnaire — NO department-specific questions.
// Every applicant answers the SAME questions regardless of dept.
// `id` is a stable machine key; `label` is the human prompt.
// ============================================================
export const COMMON_QUESTIONS = [
  {
    id: "whyJoin",
    label: "Why do you want to join Google Developer Groups?",
    type: "long-text",
    placeholder:
      "Tell us what excites you about GDG and what you hope to gain (2-3 sentences).",
    required: true,
  },
  {
    id: "strengths",
    label:
      "What are your key strengths or skills relevant to the department(s) you're applying for?",
    type: "long-text",
    placeholder:
      "Mention technical tools, soft skills, past projects or experience (2-3 sentences).",
    required: true,
  },
  {
    id: "pastExperience",
    label:
      "Describe a project, event or experience you are proud of and your role in it.",
    type: "long-text",
    placeholder: "It can be academic, personal or extracurricular.",
    required: false,
  },
  {
    id: "expectations",
    label:
      "If selected, how do you plan to contribute to the club community?",
    type: "long-text",
    placeholder: "Share an idea or two about how you'd add value.",
    required: false,
  },
];

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
];

// Mailing template (placeholders #name and #dept are replaced per recipient).
export const mailingTemplate = {
  Interview:
    "<p>Hi <strong>#name</strong>,</p><p>Thank you for applying to the <strong>#dept</strong> team at Google Developer Groups! We're excited to let you know that you've been shortlisted for an interview.</p><p>We look forward to meeting you!</p>",
};
