"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { MousePointer } from "lucide-react";
import { SocialLinks } from "./social-links";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-[80vh] sm:min-h-screen flex items-start sm:items-center justify-center pt-16 sm:pt-0 scroll-mt-16"
    >
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
              </span>
              Available for opportunities
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight"
          >
            Crafting digital experiences that{" "}
            <span className="text-primary">matter</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl"
          >
            Fullstack developer turning complex problems into elegant, 
            user-focused solutions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <SocialLinks />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="absolute -bottom-10 sm:bottom-10 lg:bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-sm text-muted-foreground mb-2">
          Scroll to explore
        </span>
        <MousePointer className="size-4 text-muted-foreground animate-bounce" />
      </motion.div>
    </section>
  );
}
