"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { useUserLocationInfo } from "@/components/userLocationInfo";
import TitleBar from "@/components/titlebar";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ContactSection } from "@/components/sections/contact-section";

export default function Home() {
  const targetRef = useRef(null);
  const [githubProjects, setGithubProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/github-projects")
      .then((res) => res.json())
      .then((data) => setGithubProjects(data));
  }, []);

  const { resumeUrl } = useUserLocationInfo();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TitleBar title="Filippo De Silva" />

      <main className="flex-1 pt-16">
        <HeroSection />
        <AboutSection resumeUrl={resumeUrl} />
        <SkillsSection />
        <Suspense fallback={<div>Loading...</div>}>
          <ProjectsSection ref={targetRef} githubProjects={githubProjects} />
        </Suspense>
        <ContactSection />
      </main>
      
      <Footer />
    </div>
  );
}
