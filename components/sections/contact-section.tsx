"use client";

import { motion } from "framer-motion";
import { MoveDown } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SocialLinks } from "./social-links";

export function ContactSection() {
  return (
    <section id="contact" className="py-32">
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
            <span className="text-sm font-medium text-primary">Contact</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">
              Let's Work Together
            </h2>
            <div className="w-12 h-1 bg-primary"></div>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed mb-12">
            I'm currently available for freelance work and full-time opportunities. 
            If you're looking for a fullstack developer who can deliver thoughtful, 
            user-centered software solutions, let's connect.
          </p>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-[1fr,auto] gap-8 items-start">
            {/* Contact Form */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-primary/5 blur-lg"></div>
              <div className="relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
                <ContactForm />
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-col items-center justify-center lg:min-w-[200px] space-y-6">
              <div className="flex flex-col items-center">
                <div className="flex justify-center mb-4 animate-bounce text-primary">
                  <MoveDown size={24} />
                </div>
                <p className="text-sm text-muted-foreground mb-4 text-center">Or connect with me on</p>
                <div className="flex flex-col gap-4">
                  <SocialLinks size={7} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
