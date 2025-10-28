"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { MousePointer } from "lucide-react";
import { SocialLinks } from "./social-links";

export function HeroSection() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.05], [1, 0.97]);

  return (
    <section
      id="home"
      className="relative min-h-[80vh] flex items-center overflow-hidden"
    >
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ opacity, scale }}
          className="max-w-3xl"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6"
          >
            <span className="relative flex size-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full size-3 bg-primary"></span>
            </span>
            Available for new opportunities
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6"
          >
            Fullstack Developer with focus on{" "}
            <span className="text-primary">user-centered</span> solutions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-[600px] text-lg text-muted-foreground mb-8"
          >
            I design digital experiences that solve real problems for users
            while meeting business objectives. My approach combines
            research, strategy, and thoughtful design execution.
          </motion.p>

          <div className="pt-5">
            <SocialLinks />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-sm text-muted-foreground mb-2">
          Scroll to explore
        </span>
        <MousePointer className="size-4 text-muted-foreground animate-bounce" />
      </motion.div>
    </section>
  );
}
