"use client";

import { motion } from "framer-motion";
import { SkillCard } from "@/components/shared";
import { skills } from "@/lib/constants";

export function SkillsSection() {
  return (
    <section id="skills" className="w-full py-20 md:py-24 lg:py-32">
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
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">Skills</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">
              Technical Expertise
            </h2>
            <div className="w-12 h-1 bg-primary"></div>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed mb-12">
            A comprehensive toolkit covering the full development lifecycle—from crafting 
            intuitive user interfaces to architecting robust backend systems and deploying 
            scalable solutions.
          </p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.15,
                  ease: "easeOut"
                }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <SkillCard skill={skill} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
