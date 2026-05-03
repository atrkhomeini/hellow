"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "../ui/card";
import { Calendar, ExternalLink } from "lucide-react";

/* ==========================================================================
   Types & Interfaces
   ========================================================================== */

export interface TimelineEvent {
  id?: string;
  year: string;
  title: string;
  subtitle?: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
  externalLinks?: { title: string; url: string }[];
}

export interface ScrollTimelineProps {
  events: TimelineEvent[];
  title?: string;
  subtitle?: string;
  animationOrder?: "sequential" | "staggered" | "simultaneous";
  cardAlignment?: "alternating" | "left" | "right";
  lineColor?: string;
  activeColor?: string;
  glowColor?: string;
  progressIndicator?: boolean;
  cardVariant?: "default" | "elevated" | "outlined" | "filled";
  cardEffect?: "none" | "glow" | "shadow" | "bounce";
  parallaxIntensity?: number;
  progressLineWidth?: number;
  progressLineCap?: "round" | "square";
  dateFormat?: "text" | "badge";
  className?: string;
  revealAnimation?: "fade" | "slide" | "scale" | "flip" | "none";
  connectorStyle?: "dots" | "line" | "dashed";
  perspective?: boolean;
  darkMode?: boolean;
  smoothScroll?: boolean;
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    year: "2023",
    title: "Major Achievement",
    subtitle: "Organization Name",
    description:
      "- Led the development of a new product feature\n- Increased team productivity by 25%\n- Mentored 3 junior developers",
  },
  {
    year: "2022",
    title: "Important Milestone",
    subtitle: "Organization Name",
    description: "- Delivered project ahead of schedule\n- Received employee of the year award",
  },
  {
    year: "2021",
    title: "Key Event",
    subtitle: "Organization Name",
    description: "- Joined the company as a mid-level developer\n- Completed certification in cloud technologies",
  },
];

/* ==========================================================================
   Description Parser Utility
   ========================================================================== */

/**
 * Parses description text into an array of bullet points.
 * Handles multiple formats:
 * 1. Hyphen-separated lines: "- Item 1\n- Item 2"
 * 2. Existing HTML: "<li>Item 1</li><li>Item 2</li>"
 * 3. Plain text (returned as single item)
 */
function parseDescription(description: string): string[] {
  if (!description) return [];

  // Check if it's HTML with <li> tags
  if (description.includes("<li>")) {
    const liMatches = description.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (liMatches) {
      return liMatches.map((match) =>
        match.replace(/<li[^>]*>|<\/li>/gi, "").trim()
      );
    }
  }

  // Check for hyphen-separated bullet points
  // Match lines starting with "-" (with optional whitespace)
  const bulletRegex = /^[ \t]*-[ \t]+(.+)$/gm;
  const matches = [...description.matchAll(bulletRegex)];

  if (matches.length > 0) {
    return matches.map((match) => match[1].trim());
  }

  // Check for newline-separated items (without hyphens)
  const lines = description
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  // If multiple lines, treat each as a bullet point
  if (lines.length > 1) {
    return lines;
  }

  // Single paragraph - return as single item (no bullets)
  return [description];
}

/**
 * Determines if description should be rendered as a list or paragraph
 */
function shouldRenderAsList(description: string): boolean {
  if (!description) return false;

  // Check for hyphen bullets
  if (/^[ \t]*-[ \t]+/m.test(description)) return true;

  // Check for HTML list
  if (description.includes("<li>")) return true;

  // Check for multiple lines
  const lines = description.split(/\n/).filter((line) => line.trim().length > 0);
  return lines.length > 1;
}

/* ==========================================================================
   Description Renderer Component
   ========================================================================== */

interface DescriptionRendererProps {
  description: string;
  className?: string;
}

const DescriptionRenderer: React.FC<DescriptionRendererProps> = ({
  description,
  className,
}) => {
  const isList = shouldRenderAsList(description);

  if (isList) {
    const items = parseDescription(description);

    return (
      <ul className={cn("list-disc ml-5 space-y-1.5 leading-relaxed", className)}>
        {items.map((item, index) => (
          <li key={index} className="text-muted-foreground text-sm pl-1">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  // Single paragraph - render as plain text
  return (
    <p className={cn("text-muted-foreground leading-relaxed text-sm", className)}>
      {description}
    </p>
  );
};

/* ==========================================================================
   Timeline Item Component
   ========================================================================== */

interface TimelineItemProps {
  event: TimelineEvent;
  index: number;
  activeIndex: number;
  smoothProgress: MotionValue<number>;
  parallaxIntensity: number;
  cardAlignment: "alternating" | "left" | "right";
  cardVariant: "default" | "elevated" | "outlined" | "filled";
  cardEffect: "none" | "glow" | "shadow" | "bounce";
  revealAnimation: "fade" | "slide" | "scale" | "flip" | "none";
  perspective: boolean;
  dateFormat: "text" | "badge";
  animationOrder: "sequential" | "staggered" | "simultaneous";
  glowColor: string;
  setRef: (el: HTMLDivElement | null) => void;
}

const TimelineItem = ({
  event,
  index,
  activeIndex,
  smoothProgress,
  parallaxIntensity,
  cardAlignment,
  cardVariant,
  cardEffect,
  revealAnimation,
  perspective,
  dateFormat,
  animationOrder,
  glowColor,
  setRef,
}: TimelineItemProps) => {
  const yOffset = useTransform(
    smoothProgress,
    [0, 1],
    [parallaxIntensity * 100, -parallaxIntensity * 100]
  );

  const getCardVariants = () => {
    const baseDelay =
      animationOrder === "simultaneous"
        ? 0
        : animationOrder === "staggered"
        ? index * 0.15
        : index * 0.25;

    const initialStates = {
      fade: { opacity: 0, y: 30 },
      slide: {
        x:
          cardAlignment === "left"
            ? -120
            : cardAlignment === "right"
            ? 120
            : index % 2 === 0
            ? -120
            : 120,
        opacity: 0,
        y: 20,
      },
      scale: { scale: 0.85, opacity: 0 },
      flip: { rotateY: 90, opacity: 0 },
      none: { opacity: 1 },
    };

    return {
      initial: initialStates[revealAnimation],
      whileInView: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotateY: 0,
        transition: {
          duration: 0.8,
          delay: baseDelay,
          ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
        },
      },
      viewport: { once: false, margin: "-80px" },
    };
  };

  const getCardClasses = () => {
    const baseClasses = "relative z-30 rounded-xl transition-all duration-500 ease-out";

    const variantClasses = {
      default: "bg-card border border-border/50 shadow-sm",
      elevated: "bg-card border border-border/40 shadow-lg backdrop-blur-sm",
      outlined: "bg-card/50 backdrop-blur-md border-2 border-primary/20",
      filled: "bg-primary/5 border border-primary/20",
    };

    const effectClasses = {
      none: "",
      glow: "hover:shadow-[0_0_30px_rgba(62,207,142,0.3),0_0_60px_rgba(62,207,142,0.15)] hover:border-primary/40",
      shadow: "hover:shadow-2xl hover:-translate-y-2 hover:border-primary/30",
      bounce: "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
    };

    const alignmentClassesDesktop =
      cardAlignment === "alternating"
        ? index % 2 === 0
          ? "lg:mr-[calc(50%+24px)]"
          : "lg:ml-[calc(50%+24px)]"
        : cardAlignment === "left"
        ? "lg:mr-auto lg:ml-0"
        : "lg:ml-auto lg:mr-0";

    return cn(
      baseClasses,
      variantClasses[cardVariant],
      effectClasses[cardEffect],
      alignmentClassesDesktop,
      "w-full lg:w-[calc(50%-48px)]"
    );
  };

  // 3D rotation on hover
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!perspective) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotateX((y - centerY) / 20);
    setRotateY((centerX - x) / 20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      key={event.id || index}
      ref={setRef}
      className={cn(
        "relative flex items-center mb-16 py-4",
        "flex-col lg:flex-row",
        cardAlignment === "alternating"
          ? index % 2 === 0
            ? "lg:justify-start"
            : "lg:flex-row-reverse lg:justify-start"
          : cardAlignment === "left"
          ? "lg:justify-start"
          : "lg:flex-row-reverse lg:justify-start"
      )}
    >
      {/* Timeline Node Dot */}
      <div
        className={cn(
          "absolute top-1/2 transform -translate-y-1/2 z-30",
          "left-1/2 -translate-x-1/2"
        )}
      >
        <motion.div
          className={cn(
            "w-5 h-5 rounded-full border-4 bg-background flex items-center justify-center transition-colors duration-300",
            index <= activeIndex
              ? "border-primary"
              : "border-border/50"
          )}
          animate={
            index <= activeIndex
              ? {
                  scale: [1, 1.4, 1],
                  boxShadow: [
                    `0 0 0px ${glowColor}00`,
                    `0 0 20px ${glowColor}80`,
                    `0 0 0px ${glowColor}00`,
                  ],
                }
              : {}
          }
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Card with 3D Effect */}
      <motion.div
        className={cn(
          getCardClasses(),
          "mt-12 lg:mt-0",
          perspective && "transform-gpu"
        )}
        variants={getCardVariants()}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: false, margin: "-80px" }}
        style={{
          y: parallaxIntensity > 0 ? yOffset : undefined,
          rotateX: perspective ? rotateX : 0,
          rotateY: perspective ? rotateY : 0,
          transformStyle: perspective ? "preserve-3d" : undefined,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glow overlay for glow effect */}
        {cardEffect === "glow" && (
          <div
            className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}10, transparent 40%)`,
            }}
          />
        )}

        <Card className="bg-transparent border-0 shadow-none">
          <CardContent className="p-6">
            {/* Date Badge */}
            {dateFormat === "badge" ? (
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: `${glowColor}15`,
                    color: glowColor,
                  }}
                >
                  {event.icon || <Calendar className="h-3.5 w-3.5" />}
                  <span>{event.year}</span>
                </div>
              </div>
            ) : (
              <p
                className="text-lg font-bold mb-2"
                style={{ color: glowColor }}
              >
                {event.year}
              </p>
            )}

            {/* Title */}
            <h3 className="text-xl font-bold mb-1 text-foreground leading-tight">
              {event.title}
            </h3>

            {/* Subtitle (Company) */}
            {event.subtitle && (
              <p className="text-muted-foreground font-medium text-sm">
                {event.subtitle}
              </p>
            )}

            {/* Description with proper spacing and bullet points */}
            {/* mt-4 creates clear separation between company and description */}
            {event.description && (
              <div className="mt-4">
                <DescriptionRenderer description={event.description} />
              </div>
            )}

            {/* External Links */}
            {event.externalLinks && event.externalLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {event.externalLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: `${glowColor}15`,
                      color: glowColor,
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {link.title}
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

/* ==========================================================================
   Main ScrollTimeline Component
   ========================================================================== */

export const ScrollTimeline = ({
  events = DEFAULT_EVENTS,
  title = "Timeline",
  subtitle = "Scroll to explore the journey",
  animationOrder = "staggered",
  cardAlignment = "alternating",
  lineColor = "#2e2e2e",
  activeColor = "#3ecf8e",
  glowColor = "#3ecf8e",
  progressIndicator = true,
  cardVariant = "elevated",
  cardEffect = "glow",
  parallaxIntensity = 0.15,
  progressLineWidth = 2,
  progressLineCap = "round",
  dateFormat = "badge",
  revealAnimation = "slide",
  className = "",
  connectorStyle = "dashed",
  perspective = true,
  darkMode = true,
}: ScrollTimelineProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const timelineRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  const progressHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((v) => {
      const newIndex = Math.floor(v * events.length);
      if (
        newIndex !== activeIndex &&
        newIndex >= 0 &&
        newIndex < events.length
      ) {
        setActiveIndex(newIndex);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, events.length, activeIndex]);

  // Dashed connector style using background-image pattern
  const getConnectorStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      top: 0,
      height: "100%",
      zIndex: 10,
    };

    switch (connectorStyle) {
      case "dots":
        return {
          ...baseStyle,
          width: "4px",
          backgroundImage: `radial-gradient(circle, ${lineColor} 50%, transparent 50%)`,
          backgroundSize: "4px 16px",
          backgroundPosition: "center",
        };
      case "dashed":
        return {
          ...baseStyle,
          width: `${progressLineWidth}px`,
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            ${lineColor} 0,
            ${lineColor} 8px,
            transparent 8px,
            transparent 16px
          )`,
        };
      case "line":
      default:
        return {
          ...baseStyle,
          width: `${progressLineWidth}px`,
          backgroundColor: lineColor,
        };
    }
  };

  return (
    <div
      ref={scrollRef}
      className={cn(
        "relative w-full overflow-hidden",
        darkMode ? "bg-background text-foreground" : "",
        className
      )}
    >
      {/* Header Section */}
      <div className="text-center py-16 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold mb-4 text-foreground"
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Timeline Container */}
      <div className="relative max-w-6xl mx-auto px-4 pb-24">
        <div className="relative mx-auto">
          {/* Background Connector Line */}
          <div style={getConnectorStyle()} />

          {/* Enhanced Progress Indicator with Traveling Glow */}
          {progressIndicator && (
            <>
              {/* The main filled progress line */}
              <motion.div
                className="absolute top-0 z-10"
                style={{
                  height: progressHeight,
                  width: progressLineWidth,
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderRadius: progressLineCap === "round" ? "9999px" : "0px",
                  background: `linear-gradient(
                    to bottom,
                    ${glowColor},
                    ${glowColor}cc,
                    ${glowColor}99
                  )`,
                  boxShadow: `
                    0 0 10px ${glowColor}60,
                    0 0 20px ${glowColor}40,
                    0 0 30px ${glowColor}20
                  `,
                }}
              />

              {/* The traveling glow "comet" at the head of the line */}
              <motion.div
                className="absolute z-20"
                style={{
                  top: progressHeight,
                  left: "50%",
                  translateX: "-50%",
                  translateY: "-50%",
                }}
              >
                <motion.div
                  className="w-4 h-4 rounded-full"
                  style={{
                    background: `radial-gradient(
                      circle,
                      ${glowColor}ff 0%,
                      ${glowColor}cc 30%,
                      ${glowColor}00 70%
                    )`,
                    boxShadow: `
                      0 0 10px 3px ${glowColor}99,
                      0 0 20px 6px ${glowColor}66,
                      0 0 30px 10px ${glowColor}33
                    `,
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </>
          )}

          {/* Timeline Events */}
          <div className="relative z-20">
            {events.map((event, index) => (
              <TimelineItem
                key={event.id || index}
                event={event}
                index={index}
                activeIndex={activeIndex}
                smoothProgress={smoothProgress}
                parallaxIntensity={parallaxIntensity}
                cardAlignment={cardAlignment}
                cardVariant={cardVariant}
                cardEffect={cardEffect}
                revealAnimation={revealAnimation}
                perspective={perspective}
                dateFormat={dateFormat}
                animationOrder={animationOrder}
                glowColor={glowColor}
                setRef={(el) => {
                  timelineRefs.current[index] = el;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};