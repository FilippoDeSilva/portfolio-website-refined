"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react"
import { useState, useRef } from "react"

interface SkillCardProps {
  skill: {
    name: string
    icon: ReactNode
    items: string[]
  }
}

export function SkillCard({ skill }: SkillCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <Card 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative overflow-hidden h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Mouse spotlight effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--primary-rgb, 99, 102, 241), 0.15), transparent 80%)`,
        }}
      />
      
      <CardContent className="relative p-6 z-10">
        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
            {skill.icon}
          </div>
          <h3 className="text-lg font-semibold">{skill.name}</h3>
        </div>

        {/* Skills List */}
        <ul className="space-y-2.5">
          {skill.items.map((item, index) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="flex items-center gap-2.5"
            >
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary"></div>
              <span className="text-sm text-muted-foreground">{item}</span>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
