"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { useUserLocationInfo } from "@/components/shared";
import TitleBar from "@/components/layout/titlebar";
import { Footer } from "@/components/layout";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ContactSection } from "@/components/sections/contact-section";
import { projectsCache, getProjectsCacheKey } from "@/lib/projects-cache";

export default function Home() {
  const targetRef = useRef(null);
  const [githubProjects, setGithubProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const cacheKey = getProjectsCacheKey();
      
      // Try to get fresh cache first
      const cachedData = projectsCache.get<any[]>(cacheKey);
      if (cachedData) {
        console.log('[Projects] Using fresh cache');
        setGithubProjects(cachedData);
        setIsLoading(false);
        return;
      }

      // If no fresh cache, try stale cache (SWR pattern)
      const staleData = projectsCache.getStale<any[]>(cacheKey);
      if (staleData) {
        console.log('[Projects] Using stale cache, revalidating in background');
        setGithubProjects(staleData);
        setIsLoading(false);
      }

      // Fetch fresh data (either no cache or revalidating stale)
      try {
        const res = await fetch("/api/github-projects");
        const data = await res.json();
        
        // Update cache and state
        projectsCache.set(cacheKey, data);
        setGithubProjects(data);
        setIsLoading(false);
        console.log('[Projects] Fetched and cached fresh data');
      } catch (error) {
        console.error('[Projects] Failed to fetch:', error);
        // If fetch fails and we have stale data, keep using it
        if (!staleData) {
          setIsLoading(false);
        }
      }
    };

    fetchProjects();
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
