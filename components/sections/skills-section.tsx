"use client";

import { motion } from "framer-motion";
import { SkillCard } from "@/components/skill-card";
import { skills } from "@/lib/constants";

export function SkillsSection() {
  return (
    <section id="skills" className="py-24 bg-muted/20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
            Professional Skills
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Expertise & Capabilities
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            My skill set spans from Frontend technologies to Backend
            technologies.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <SkillCard skill={skill} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
