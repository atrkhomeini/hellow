"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Supabase green glow color
const GLOW_COLOR = "#3ecf8e";

interface ExpandableCardProps {
  title: string;
  src: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  classNameExpanded?: string;
  tags?: { id: string; name: string; color?: string }[];
  links?: {
    demo?: string;
    github?: string;
  };
  category?: string;
  glowColor?: string;
  [key: string]: any;
}

export function ExpandableCard({
  title,
  src,
  description,
  children,
  className,
  classNameExpanded,
  tags = [],
  links,
  category,
  glowColor = GLOW_COLOR,
  ...props
}: ExpandableCardProps) {
  const [active, setActive] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActive(false);
      }
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setActive(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 h-full w-full bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Expanded Card */}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-8">
            <motion.div
              layoutId={`card-${title}-${id}`}
              ref={cardRef}
              className={cn(
                "relative flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-auto rounded-2xl border border-border bg-card shadow-2xl",
                classNameExpanded
              )}
              style={{
                boxShadow: `0 0 50px ${glowColor}20, 0 0 100px ${glowColor}10, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`,
              }}
              {...props}
            >
              {/* Image */}
              <motion.div layoutId={`image-${title}-${id}`}>
                <div className="relative">
                  <img
                    src={src}
                    alt={title}
                    className="h-64 sm:h-80 w-full object-cover rounded-t-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent rounded-t-2xl" />
                </div>
              </motion.div>

              {/* Content */}
              <div className="relative flex-1 overflow-auto">
                <div className="p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <motion.p
                        layoutId={`description-${description}-${id}`}
                        className="text-sm text-muted-foreground mb-1"
                      >
                        {description}
                      </motion.p>
                      <motion.h3
                        layoutId={`title-${title}-${id}`}
                        className="text-2xl sm:text-3xl font-bold text-foreground"
                      >
                        {title}
                      </motion.h3>
                    </div>
                    
                    {/* Close button */}
                    <motion.button
                      aria-label="Close card"
                      layoutId={`button-${title}-${id}`}
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        "border border-border bg-surface-300 text-foreground",
                        "transition-all duration-300"
                      )}
                      style={{
                        boxShadow: isHovered ? `0 0 20px ${glowColor}40` : "none",
                      }}
                      onClick={() => setActive(false)}
                      whileHover={{
                        boxShadow: `0 0 20px ${glowColor}60`,
                        borderColor: `${glowColor}50`,
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Category Badge */}
                  {category && (
                    <div className="mb-4">
                      <Badge
                        variant={category === "in-development" ? "default" : "secondary"}
                        className={cn(
                          category === "in-development" && "bg-amber-500/20 text-amber-500"
                        )}
                      >
                        {category === "in-development" ? "🚧 In Development" : "✓ Past Project"}
                      </Badge>
                    </div>
                  )}

                  {/* Children content */}
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {children}
                  </motion.div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-foreground mb-3">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-sm hover:border-primary/50 transition-colors"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  {links && (links.demo || links.github) && (
                    <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                      {links.demo && (
                        <Button 
                          asChild 
                          className="transition-all duration-300 hover:shadow-lg"
                          style={{
                            backgroundColor: glowColor,
                          }}
                        >
                          <a href={links.demo} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Live Demo
                          </a>
                        </Button>
                      )}
                      {links.github && (
                        <Button 
                          asChild 
                          variant="outline"
                          className="transition-all duration-300"
                        >
                          <a href={links.github} target="_blank" rel="noopener noreferrer">
                            <FaGithub className="w-4 h-4 mr-2" />
                            View Code
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Card (collapsed) */}
      <motion.div
        role="dialog"
        aria-labelledby={`card-title-${id}`}
        aria-modal="true"
        layoutId={`card-${title}-${id}`}
        onClick={() => setActive(true)}
        className={cn(
          "flex cursor-pointer flex-col rounded-2xl border border-border bg-card overflow-hidden",
          "transition-all duration-500 ease-out group",
          className
        )}
        style={{
          boxShadow: isHovered
            ? `0 0 30px ${glowColor}30, 0 0 60px ${glowColor}15, 0 0 100px ${glowColor}08`
            : "none",
          borderColor: isHovered ? `${glowColor}50` : undefined,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative overflow-hidden">
          <motion.div layoutId={`image-${title}-${id}`}>
            <img
              src={src}
              alt={title}
              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          
          {/* Category Badge */}
          {category && (
            <div className="absolute top-3 right-3">
              <Badge
                variant={category === "in-development" ? "default" : "secondary"}
                className={cn(
                  category === "in-development" && "bg-amber-500/20 text-amber-500"
                )}
              >
                {category === "in-development" ? "In Dev" : "Past"}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <motion.p
                layoutId={`description-${description}-${id}`}
                className="text-xs text-muted-foreground mb-1"
              >
                {description}
              </motion.p>
              <motion.h3
                layoutId={`title-${title}-${id}`}
                className="text-lg font-semibold text-foreground truncate"
              >
                {title}
              </motion.h3>
            </div>
            
            <motion.button
              aria-label="Open card"
              layoutId={`button-${title}-${id}`}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                "border border-border bg-surface-300 text-foreground",
                "transition-all duration-300"
              )}
              style={{
                boxShadow: isHovered ? `0 0 15px ${glowColor}40` : "none",
              }}
              whileHover={{
                boxShadow: `0 0 20px ${glowColor}60`,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </motion.button>
          </div>

          {/* Tags preview */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.slice(0, 3).map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="outline" 
                  className="text-xs transition-colors group-hover:border-primary/30"
                >
                  {tag.name}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}