"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ShinyText from "@/components/ui/shiny-text";
import Typewriter from "@/components/fancy/text/typewriter";

interface AboutSectionProps {
  resumeUrl: string;
}

export function AboutSection({ resumeUrl }: AboutSectionProps) {
  return (
    <section id="about" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center"
        >
          <div className="relative order-2 lg:order-1 hidden lg:block">
            <div className="absolute -inset-4 rounded-xl bg-primary/5 blur-lg"></div>
            <div className="relative w-full h-[50px] md:h-[420px] lg:h-[520px] overflow-hidden rounded-xl border border-border/50 bg-muted/20">
              <Image
                src="https://cdn.pixabay.com/photo/2024/04/09/03/04/ai-generated-8684869_1280.jpg"
                alt="Fullstack Developer"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6">
              About Me
            </div>
            
            <section className="bg-muted/20">
              <div className="container">
                <div className="text-left">
                  <span className="-ml-5 -mt-4 text-base font-bold tracking-tight sm:text-2xl">
                    Designing with{" "}
                  </span>
                  <Typewriter
                    text={["Impact.", "Purpose.", "Precision."]}
                    speed={100}
                    className="text-base font-bold text-primary tracking-tight sm:text-2xl text-pretty"
                    waitTime={1500}
                    deleteSpeed={100}
                    loop={true}
                    cursorChar={""}
                  />
                </div>
              </div>
            </section>
            
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 shadow-[0_0_10px_rgba(var(--primary),0.3)] animate-pulse"></div>

              <div className="pl-6 space-y-4 pt-4 text-muted-foreground">
                <p>
                  I'm a Fullstack Developer creating user-centered digital
                  products. My Computer Science background shapes how I
                  approach problems and find optimal solutions through
                  strategic thinking and meticulous execution.
                </p>
                <p>
                  My design process starts with researching users' needs,
                  then creating logical information architecture and
                  designing interfaces that are both functional and
                  attractive, delivering seamless digital experiences.
                </p>
              </div>
            </div>

            <div className="mt-12 ml-6 flex flex-col sm:flex-row gap-4">
              <Button>
                <Link href="#contact">
                  <ShinyText
                    text="Get In Touch"
                    disabled={false}
                    speed={2}
                    className="custom-class"
                  />
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = resumeUrl;
                }}
              >
                Download Resume
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
