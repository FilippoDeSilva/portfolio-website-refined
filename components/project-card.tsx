"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Star, GitFork } from "lucide-react"
import Link from "next/link"

interface Project {
  title: string
  description: string
  image: string
  githubOgImage?: string
  tags?: string[]
  link?: string
  github?: string
  stars?: number
  forks?: number
  watchers?: number
  isDeployed?: boolean
}

export function ProjectCard({ project }: { project: Project }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [imgError, setImgError] = useState(false)
  const [showAllTags, setShowAllTags] = useState(false)
  const [isImageHovered, setIsImageHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  // Validate URLs
  const hasValidLiveLink = project.link && project.link !== '#'
  const hasValidGithubLink = project.github && project.github !== '#'
  
  // Use screenshot for deployed, GitHub mark for non-deployed
  const displayImage = imgError 
    ? '/placeholder.svg' 
    : (project.isDeployed ? project.image : '/github-mark.svg')

  return (
    <Card
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative overflow-hidden h-full flex flex-col border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Mouse spotlight effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--primary-rgb, 99, 102, 241), 0.1), transparent 80%)`,
        }}
      />

      {/* Project Image */}
      <div 
        className="relative h-48 overflow-hidden bg-muted/20 group/image"
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
      >
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
        )}
        
        <img
          src={displayImage}
          alt={project.title}
          className={`w-full h-full transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${project.isDeployed ? 'object-cover' : 'object-contain p-8 dark:brightness-0 dark:invert'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImgError(true)
            setImageLoaded(true)
          }}
        />
        
        {/* Theme-aware Overlay on Hover */}
        <div className={`absolute inset-0 bg-white/70 dark:bg-black/50 transition-opacity duration-300 ${isImageHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {/* Hover Overlay with Actions */}
        <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-300 ${isImageHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {hasValidGithubLink && (
            <Button 
              asChild 
              size="sm" 
              variant="secondary" 
              className="!bg-secondary hover:!bg-secondary hover:brightness-110 !opacity-100 backdrop-blur-sm transition-all duration-200"
            >
              <Link href={project.github!} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                Code
              </Link>
            </Button>
          )}
          {hasValidLiveLink && (
            <Button 
              asChild 
              size="sm" 
              className="!bg-primary hover:!bg-primary hover:brightness-110 !opacity-100 backdrop-blur-sm transition-all duration-200"
            >
              <Link href={project.link!} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Live
              </Link>
            </Button>
          )}
        </div>
      </div>

      <CardContent className="relative p-6 flex flex-col flex-1 z-10">
        {/* Title & Description */}
        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-3">
          {project.description || "No description available"}
        </p>

        {/* Tags - Collapsible */}
        {project.tags && project.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {(showAllTags ? project.tags : project.tags.slice(0, 4)).map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded bg-muted/60 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 4 && (
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="text-xs px-2 py-0.5 text-primary hover:text-primary/80 transition-colors"
                >
                  {showAllTags ? 'Show less' : `+${project.tags.length - 4} more`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stats & Actions */}
        <div className="flex items-center pt-4 border-t border-border/50">
          {/* GitHub Stats */}
          <div className="flex gap-3 text-xs text-muted-foreground">
            {project.stars !== undefined && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {project.stars}
              </span>
            )}
            {project.forks !== undefined && (
              <span className="flex items-center gap-1">
                <GitFork className="w-3 h-3" />
                {project.forks}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

