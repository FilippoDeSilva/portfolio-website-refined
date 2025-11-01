"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AboutSectionProps {
  resumeUrl: string;
}

export function AboutSection({ resumeUrl }: AboutSectionProps) {
  return (
    <section id="about" className="py-32">
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
            <span className="text-sm font-medium text-primary">About</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">Who I Am</h2>
            <div className="w-12 h-1 bg-primary"></div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                I'm a <span className="text-foreground font-semibold">Fullstack Developer</span> passionate 
                about building robust, scalable software solutions that solve real-world problems and deliver 
                exceptional user experiences. Currently working at{" "}
                <span className="text-foreground font-semibold">YaYa Wallet</span>, I create applications 
                that combine technical excellence with thoughtful design to make a meaningful impact.
              </p>
              
              <p>
                With a Computer Science background and 5+ years of experience, I specialize in full stack 
                web development—crafting end-to-end solutions from intuitive frontends to powerful backend 
                systems. My focus is on clean code, scalable architectures, performance optimization, and 
                building products that users genuinely love to use every day.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4 pt-12">
            <Link href="#contact">
              <Button 
                size="lg" 
                className="shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
              >
                Get In Touch
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                window.location.href = resumeUrl;
              }}
            >
              Download Resume
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
