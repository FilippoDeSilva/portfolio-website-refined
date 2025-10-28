import Link from "next/link";
import { Github, Linkedin, Send } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";

interface SocialLinksProps {
  size?: number;
}

export function SocialLinks({ size = 6 }: SocialLinksProps) {
  return (
    <div className="flex gap-4">
      <Link
        href={SOCIAL_LINKS.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        <Linkedin className={`size-${size}`} />
        <span className="sr-only">LinkedIn</span>
      </Link>
      <Link
        href={SOCIAL_LINKS.github}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        <Github className={`size-${size}`} />
        <span className="sr-only">GitHub</span>
      </Link>
      <Link
        href={SOCIAL_LINKS.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        <Send className={`size-${size} transition-transform group-hover:translate-x-1`} />
        <span className="sr-only">Telegram</span>
      </Link>
    </div>
  );
}
