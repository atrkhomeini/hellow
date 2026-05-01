"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { usePortfolioStore } from "@/store/portfolio-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SimpleTabs } from "@/components/ui/simple-tabs";

export function ProjectsSection() {
  const { projects } = usePortfolioStore();
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  tags={project.skills || []}
                  links={{
                    demo: project.projectUrl || undefined,
                    github: project.githubUrl || undefined,
                  }}
                  category={project.category}
                  className="h-full"
                >
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description || "No description available."}
                  </p>
                </ExpandableCard>
              </motion.div>
            ))}
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