import { Code, Server, Database } from "lucide-react";

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/filippo-de-silva",
  github: "https://github.com/FilippoDeSilva",
  telegram: "https://t.me/Lt_Col_Sam",
} as const;

export const skills = [
  {
    name: "Frontend Development",
    icon: <Code className="size-6 text-primary" />,
    items: [
      "Next.js",
      "React",
      "Tailwind CSS",
      "HTML5/CSS3",
      "JavaScript/TypeScript",
    ],
  },
  {
    name: "Backend Development",
    icon: <Server className="size-6 text-primary" />,
    items: ["Next.js", "Node.js", "Python", "RESTful APIs"],
  },
  {
    name: "Database Management",
    icon: <Database className="size-6 text-primary" />,
    items: ["PostgreSQL", "MongoDB", "Prisma", "SQL"],
  },
  {
    name: "UI/UX Design",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6 text-primary"
      >
        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
        <path d="M12 2v2"></path>
        <path d="M12 22v-2"></path>
        <path d="m17 20.66-1-1.73"></path>
        <path d="M11 10.27 7 3.34"></path>
        <path d="m20.66 17-1.73-1"></path>
        <path d="m3.34 7 1.73 1"></path>
        <path d="M14 12h8"></path>
        <path d="M2 12h2"></path>
      </svg>
    ),
    items: [
      "Figma",
      "User Research",
      "Wire-framing",
      "Prototyping",
      "Responsive Design",
    ],
  },
  {
    name: "DevOps & Tools",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6 text-primary"
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
      </svg>
    ),
    items: ["Git", "Docker", "CI/CD", "Vercel"],
  },
  {
    name: "Soft Skills",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6 text-primary"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    items: [
      "Problem Solving",
      "Communication",
      "Teamwork",
      "Time Management",
      "Adaptability",
      "Continuous Learning",
      "Dedication",
    ],
  },
];
