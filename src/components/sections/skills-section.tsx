"use client";

import { motion } from "framer-motion";
import {
  Code2,
  MessageSquare,
  Globe,
} from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { cn } from "@/lib/utils";

// Icon lookup - returns a specific icon based on name
const getIconElement = (iconName: string | null, className: string = "w-5 h-5") => {
  const name = iconName?.toLowerCase();
  
  switch (name) {
    case "code":
    case "code2":
      return <Code2 className={className} />;
    case "message":
    case "communication":
      return <MessageSquare className={className} />;
    case "globe":
    case "world":
      return <Globe className={className} />;
    default:
      return <Code2 className={className} />;
  }
};

// SkillCard component
function SkillCard({
  skill,
  index,
}: {
  skill: {
    id: string;
    name: string;
    iconName: string | null;
    color: string | null;
  };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={cn(
        "group relative p-4 rounded-xl border border-border",
        "bg-card hover:bg-surface-300",
        "transition-all duration-300 cursor-default"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            "bg-primary/10 text-primary"
          )}
          style={skill.color ? { backgroundColor: `${skill.color}20`, color: skill.color } : undefined}
        >
          {getIconElement(skill.iconName)}
        </div>
        <span className="font-medium text-foreground">{skill.name}</span>
      </div>
    </motion.div>
  );
}

// CategorySection component
function CategorySection({
  title,
  categorySkills,
  IconComponent,
}: {
  title: string;
  categorySkills: ReturnType<typeof usePortfolioStore>["skills"];
  IconComponent: React.ReactNode;
}) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {IconComponent}
        </div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorySkills.map((skill, index) => (
          <SkillCard key={skill.id} skill={skill} index={index} />
        ))}
      </div>
    </div>
  );
}

export function SkillsSection() {
  const { skills } = usePortfolioStore();

  const softSkills = skills.filter((s) => s.category === "soft" && s.isActive);
  const hardSkills = skills.filter((s) => s.category === "hard" && s.isActive);
  const languageSkills = skills.filter(
    (s) => s.category === "language" && s.isActive
  );

  return (
    <section
      id="skills"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-100"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Skills & Expertise
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive overview of my technical and interpersonal skills
          </p>
        </motion.div>

        {hardSkills.length > 0 && (
          <CategorySection
            title="Hard Skills"
            categorySkills={hardSkills}
            IconComponent={<Code2 className="w-5 h-5" />}
          />
        )}

        {languageSkills.length > 0 && (
          <CategorySection
            title="Languages & Frameworks"
            categorySkills={languageSkills}
            IconComponent={<Globe className="w-5 h-5" />}
          />
        )}

        {softSkills.length > 0 && (
          <CategorySection
            title="Soft Skills"
            categorySkills={softSkills}
            IconComponent={<MessageSquare className="w-5 h-5" />}
          />
        )}

        {skills.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No skills to display yet. Add some in the admin panel.</p>
          </div>
        )}
      </div>
    </section>
  );
}
