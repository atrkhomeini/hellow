"use client";

import { motion } from "framer-motion";
import { usePortfolioStore } from "@/store/portfolio-store";
import ChainCarousel, { ChainItem } from "@/components/lightswind/chain-carousel";
import { Code2, type LucideIcon } from "lucide-react";

// Category labels
const categoryLabels: Record<string, string> = {
  expertise: "Expertise",
  hard: "Hard Skills",
  language: "Languages & Frameworks",
};

export function SkillsSection() {
  const { skills } = usePortfolioStore();

  // Filter active skills
  const activeSkills = skills.filter((skill) => skill.isActive);

  // Group skills by category
  const groupedSkills = {
    expertise: activeSkills.filter((s) => s.category === "expertise"),
    hard: activeSkills.filter((s) => s.category === "hard"),
    language: activeSkills.filter((s) => s.category === "language"),
  };

  // Convert skills to carousel items
  const allCarouselItems: ChainItem[] = activeSkills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    icon: Code2, // Fallback icon (used when no iconUrl)
    details: categoryLabels[skill.category] || skill.category,
    logo: skill.iconUrl || undefined, // Use uploaded icon
    category: skill.category,
  }));

  return (
    <section
      id="skills"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-200 relative overflow-hidden"
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Skills & Expertise
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Technologies I work with and skills I've developed over the years
          </p>
        </motion.div>

        {/* Chain Carousel */}
        {allCarouselItems.length > 0 ? (
          <ChainCarousel
            items={allCarouselItems}
            scrollSpeedMs={2000}
            visibleItemCount={9}
          />
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No skills to display. Add some in the admin panel.</p>
          </div>
        )}

        {/* Category Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div
              key={category}
              className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4 capitalize">
                {categoryLabels[category] || category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {categorySkills.slice(0, 6).map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-surface-300 text-foreground border border-border"
                  >
                    {skill.iconUrl && (
                      <img
                        src={skill.iconUrl}
                        alt={skill.name}
                        className="w-4 h-4 object-contain"
                      />
                    )}
                    {skill.name}
                  </span>
                ))}
                {categorySkills.length > 6 && (
                  <span className="px-3 py-1 text-sm rounded-full bg-surface-300 text-muted-foreground border border-border">
                    +{categorySkills.length - 6} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}