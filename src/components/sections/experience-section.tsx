"use client";

import { usePortfolioStore } from "@/store/portfolio-store";
import { ScrollTimeline, TimelineEvent } from "@/components/lightswind/scroll-timeline";
import { Briefcase } from "lucide-react";

// Parse external links from JSON
function parseExternalLinks(links: string | null): { title: string; url: string }[] {
  if (!links) return [];
  try {
    return JSON.parse(links);
  } catch {
    return [];
  }
}

export function ExperienceSection() {
  const { experiences } = usePortfolioStore();

  // Filter published experiences and map to TimelineEvent format
  const timelineEvents: TimelineEvent[] = experiences
    .filter((exp) => exp.isPublished)
    .map((exp) => ({
      id: exp.id,
      year: exp.isCurrent
        ? `${exp.startDate} - Present`
        : `${exp.startDate} - ${exp.endDate}`,
      title: exp.title,
      subtitle: exp.company,
      description: exp.description,
      icon: <Briefcase className="h-3.5 w-3.5" />,
      externalLinks: parseExternalLinks(exp.externalLinks),
    }));

  // Don't render if no experiences
  if (timelineEvents.length === 0) {
    return (
      <section id="experience" className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          No experience entries yet. Add some in the admin panel.
        </p>
      </section>
    );
  }

  return (
    <section id="experience">
      <ScrollTimeline
        events={timelineEvents}
        title="Experience"
        subtitle="My professional journey and career milestones"
        // Animation settings
        animationOrder="staggered"
        revealAnimation="slide"
        cardAlignment="alternating"
        // Card styling
        cardVariant="elevated"
        cardEffect="glow"
        perspective={true}
        // Connector styling
        connectorStyle="dashed"
        lineColor="#2e2e2e"
        // Progress indicator
        progressIndicator={true}
        progressLineWidth={2}
        progressLineCap="round"
        // Colors (Supabase-inspired)
        glowColor="#3ecf8e"
        // Other settings
        parallaxIntensity={0.1}
        dateFormat="badge"
        darkMode={true}
      />
    </section>
  );
}