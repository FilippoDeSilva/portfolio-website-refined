import { Code, Server, Database } from "lucide-react";

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/filippo-de-silva",
  github: "https://github.com/FilippoDeSilva",
  telegram: "https://t.me/Lt_Col_Sam",
} as const;

export const skills = [
  {
    name: "Frontend",
    icon: <Code className="size-6 text-primary" />,
    items: [
      "React & Next.js",
      "TypeScript",
      "Tailwind CSS",
    ],
  },
  {
    name: "Backend",
    icon: <Server className="size-6 text-primary" />,
    items: ["Node.js", "RESTful APIs", "Python"],
  },
  {
    name: "Database",
    icon: <Database className="size-6 text-primary" />,
    items: ["PostgreSQL", "MongoDB", "Prisma"],
  },
  {
    name: "Tools & DevOps",
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
    items: ["Git & GitHub", "Docker", "CI/CD"],
  },
];
