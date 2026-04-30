"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Code2,
  Briefcase,
  FolderKanban,
  Heart,
  Mail,
  Link2,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { ProfileManager } from "./profile-manager";
import { SkillsManager } from "./skills-manager";
import { ExperienceManager } from "./experience-manager";
import { ProjectsManager } from "./projects-manager";
import { TasteManager } from "./taste-manager";
import { MessagesManager } from "./messages-manager";
import { SocialLinksManager } from "./social-links-manager";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const sidebarItems = [
  { id: "profile", label: "Profile", icon: User },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "taste", label: "My Taste", icon: Heart },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "links", label: "Social Links", icon: Link2 },
];

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("profile");

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileManager />;
      case "skills":
        return <SkillsManager />;
      case "experience":
        return <ExperienceManager />;
      case "projects":
        return <ProjectsManager />;
      case "taste":
        return <TasteManager />;
      case "messages":
        return <MessagesManager />;
      case "links":
        return <SocialLinksManager />;
      default:
        return <ProfileManager />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-surface-200">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden lg:block">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            Admin Dashboard
          </h2>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav className="p-2 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-300"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Mobile Section Tabs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex overflow-x-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          {renderSection()}
        </motion.div>
      </main>
    </div>
  );
}
