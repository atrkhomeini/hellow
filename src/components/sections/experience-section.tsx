"use client";

import { usePortfolioStore } from "@/store/portfolio-store";
import { ScrollTimeline, TimelineEvent } from "@/components/lightswind/scroll-timeline";
import { Briefcase, MapPin, ExternalLink } from "lucide-react";

export function ExperienceSection() {
  const { experiences } = usePortfolioStore();

  const publishedExperiences = experiences.filter((e) => e.isPublished);

  const timelineEvents: TimelineEvent[] = publishedExperiences.map((exp) => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    };

    const yearLabel = exp.isCurrent
      ? `${formatDate(exp.startDate)} - Present`
      : exp.endDate
      ? `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`
      : formatDate(exp.startDate);

    const description = exp.description +
      (exp.location ? `\n\n📍 ${exp.location}` : "") +
      (exp.projectUrl ? `\n\n[View Project](${exp.projectUrl})` : "");

    return {
      id: exp.id,
      year: yearLabel,
      title: exp.title,
      subtitle: exp.company,
      description: exp.description,
      icon: exp.projectUrl ? <ExternalLink className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />,
      color: "#3ecf8e",
    };
  });

  return (
    <section id="experience" className="bg-surface-200">
      <ScrollTimeline
        events={timelineEvents.length > 0 ? timelineEvents : [
          {
            id: "1",
            year: "2024",
            title: "Senior Developer",
            subtitle: "Tech Company",
            description: "Leading development of enterprise applications.",
            color: "#3ecf8e",
          },
          {
            id: "2",
            year: "2022",
            title: "Full Stack Developer",
            subtitle: "Startup",
            description: "Built scalable web applications from scratch.",
            color: "#3ecf8e",
          },
          {
            id: "3",
            year: "2020",
            title: "Junior Developer",
            subtitle: "Agency",
            description: "Started my journey in web development.",
            color: "#3ecf8e",
          },
        ]}
        title="Experience"
        subtitle="My professional journey"
        animationOrder="sequential"
        cardAlignment="alternating"
        lineColor="bg-border"
        activeColor="bg-primary"
        progressIndicator={true}
        cardVariant="default"
        revealAnimation="fade"
        connectorStyle="line"
        darkMode={true}
        className="min-h-[50vh]"
      />
    </section>
  );
}
