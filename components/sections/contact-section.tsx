"use client";

import { motion } from "framer-motion";
import { MoveDown } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SocialLinks } from "./social-links";

export function ContactSection() {
  return (
    <section id="contact" className="py-24 bg-muted/20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2"
        >
          <div>
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
              Contact
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Let's Discuss Your Project
            </h2>
            <p className="text-muted-foreground mb-8">
              I'm currently available for freelance work and full-time
              opportunities. If you're looking for a fullstack developer who
              can deliver thoughtful, user-centered fullstack software
              solutions, let's connect.
            </p>

            <div className="flex justify-center mb-2 animate-bounce text-primary">
              <MoveDown size={24} />
            </div>
            <div className="flex items-center gap-4 justify-center pt-5">
              <SocialLinks size={7} />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-primary/5 blur-lg"></div>
            <div className="relative rounded-xl border border-border/50 bg-card p-6">
              <ContactForm />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
