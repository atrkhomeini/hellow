"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Code2, Wrench } from "lucide-react";
import SpotlightCards, { SpotlightItem } from "@/components/kokonutui/spotlight-cards";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { usePortfolioStore } from "@/store/portfolio-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SimpleTabs } from "@/components/ui/simple-tabs";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  react: Code2,
  nextjs: Code2,
  typescript: Code2,
  javascript: Code2,
  nodejs: Code2,
  python: Code2,
  default: Code2,
};

export function ProjectsSection() {
  const { projects, skills } = usePortfolioStore();
  const [selectedCategory, setSelectedCategory] = useState<"all" | "past" | "in-development">("all");

  const publishedProjects = projects.filter((p) => p.isPublished);

  const filteredProjects =
    selectedCategory === "all"
      ? publishedProjects
      : publishedProjects.filter((p) => p.category === selectedCategory);

  const tabs = [
    { label: "All Projects", value: "all" },
    { label: "Past Projects", value: "past" },
    { label: "In Development", value: "in-development" },
  ];

  // Convert projects to spotlight items
  const spotlightItems: SpotlightItem[] = filteredProjects.slice(0, 6).map((project) => ({
    icon: project.category === "in-development" ? Wrench : Code2,
    title: project.title,
    description: project.description.length > 80
      ? project.description.substring(0, 80) + "..."
      : project.description,
    color: project.category === "in-development" ? "#f59e0b" : "#3ecf8e",
  }));

  return (
    <section
      id="projects"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-100"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Projects
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore my portfolio of work, from completed projects to ongoing developments
          </p>

          {/* Category Tabs */}
          <div className="flex justify-center">
            <SimpleTabs
              tabs={tabs}
              activeTab={selectedCategory}
              onTabChange={(value) => setSelectedCategory(value as typeof selectedCategory)}
            />
          </div>
        </motion.div>

        {filteredProjects.length > 0 ? (
          <div className="space-y-8">
            {/* Spotlight Cards View */}
            <SpotlightCards
              items={spotlightItems}
              eyebrow="Portfolio"
              heading="Featured Work"
              className="bg-surface-200"
            />

            {/* Detailed Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ExpandableCard
                    title={project.title}
                    src={project.imageUrl || "/logo.svg"}
                    description={project.category === "in-development" ? "🚧 In Development" : "Past Project"}
                    className="bg-card border-border"
                  >
                    <div className="space-y-4">
                      <p className="text-foreground leading-relaxed">
                        {project.description}
                      </p>

                      {/* Skills */}
                      {project.skills && project.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.skills.map((skill) => (
                            <Badge
                              key={skill.id}
                              variant="secondary"
                              className="bg-surface-300 text-foreground"
                            >
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Links */}
                      <div className="flex gap-4 pt-4">
                        {project.projectUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "flex items-center gap-2 text-sm",
                              "text-primary hover:text-primary/80"
                            )}
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Project
                          </a>
                        )}
                      </div>
                    </div>
                  </ExpandableCard>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No projects to display yet. Add some in the admin panel.</p>
          </div>
        )}
      </div>
    </section>
  );
}
