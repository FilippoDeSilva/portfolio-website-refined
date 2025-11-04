"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ProjectCard } from "@/components/shared";

interface ProjectsSectionProps {
  githubProjects: any[];
}

export const ProjectsSection = forwardRef<HTMLElement, ProjectsSectionProps>(
  ({ githubProjects }, ref) => {
    return (
      <section id="projects" className="w-full py-20 md:py-24 lg:py-32" ref={ref}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-4xl mx-auto"
          >
            {/* Section Label */}
            <div className="mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">Projects</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">
                Selected Work
              </h2>
              <div className="w-12 h-1 bg-primary"></div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              A collection of my most impactful projects, showcasing my approach to solving 
              complex problems with clean code and thoughtful design.
            </p>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {githubProjects.length > 0 ? (
              githubProjects.map((repo: any, index: number) => {
                return (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    <ProjectCard
                      project={{
                        title: repo.name,
                        description: repo.description || "",
                        image: repo.image || "/placeholder.svg",
                        githubOgImage: `https://opengraph.githubassets.com/1/${
                          repo.owner?.login || "FilippoDeSilva"
                        }/${repo.name}`,
                        tags: repo.topics || [],
                        link: repo.homepage || "#",
                        github: repo.html_url || "#",
                        stars: repo.stargazers_count,
                        forks: repo.forks_count,
                        watchers: repo.watchers_count,
                        isDeployed:
                          repo.homepage &&
                          repo.homepage !== "" &&
                          repo.homepage !== "#",
                      }}
                    />
                  </motion.div>
                );
              })
            ) : (
              <>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-border bg-gradient-to-br from-background to-muted/40 shadow-lg flex flex-col h-[400px] p-6"
                  >
                    <div className="h-40 w-full bg-muted/60 rounded-xl mb-4" />
                    <div className="h-6 w-2/3 bg-muted/50 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-muted/40 rounded mb-4" />
                    <div className="flex-1" />
                    <div className="h-4 w-1/3 bg-muted/30 rounded mt-4" />
                  </div>
                ))}
              </>
            )}
            </div>
          </motion.div>
        </div>
      </section>
    );
  }
);

ProjectsSection.displayName = "ProjectsSection";
