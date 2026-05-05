"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Code2, Sparkles, Rocket, Terminal, Star, GitFork, Users, BookOpen } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { ExpandableCard } from "@/components/ui/expandable-card";
import { usePortfolioStore } from "@/store/portfolio-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SimpleTabs } from "@/components/ui/simple-tabs";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "@/components/ui/animated-modal";
import { Button } from "@/components/ui/button";

// GITHUB_USERNAME - Change this to your actual GitHub username
const GITHUB_USERNAME = "atrkhomeini";
const GITHUB_REPO_URL = `https://github.com/${GITHUB_USERNAME}?tab=repositories`;

interface GitHubStats {
  username: string;
  avatarUrl: string;
  name: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  languages: string[];
  languageCount: number;
  topRepos: {
    name: string;
    description: string;
    stars: number;
    language: string;
    url: string;
  }[];
}

export function ProjectsSection() {
  const { projects } = usePortfolioStore();
  const [selectedCategory, setSelectedCategory] = useState<"all" | "past" | "in-development">("all");
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

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

  // Fetch GitHub stats on component mount
  useEffect(() => {
    const fetchGitHubStats = async () => {
      try {
        const response = await fetch(`/api/github-stats?username=${GITHUB_USERNAME}`);
        if (response.ok) {
          const data = await response.json();
          setGithubStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchGitHubStats();
  }, []);

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
          <>
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

            {/* Wanna See Many More? Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center mt-12"
            >
              <Modal>
                <ModalTrigger
                  className={cn(
                    "relative overflow-hidden",
                    "bg-black dark:bg-white dark:text-black text-white",
                    "flex justify-center items-center gap-2",
                    "px-8 py-4 rounded-full font-medium",
                    "group/modal-btn transition-all duration-300",
                    "hover:shadow-lg hover:shadow-primary/20"
                  )}
                >
                  <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
                    Wanna See Many More?
                  </span>
                  <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 z-20">
                    <FaGithub className="w-5 h-5" />
                  </div>
                </ModalTrigger>

                <ModalBody>
                  <ModalContent>
                    {/* Header */}
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 overflow-hidden"
                      >
                        {githubStats?.avatarUrl ? (
                          <img 
                            src={githubStats.avatarUrl} 
                            alt={githubStats.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaGithub className="w-8 h-8 text-primary" />
                        )}
                      </motion.div>
                      
                      <h4 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                        I'll Guide To My Repo
                      </h4>
                      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        {githubStats?.bio || "Discover more projects, contributions, and code samples on my GitHub profile"}
                      </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className={cn(
                          "flex flex-col items-center gap-1 p-4 rounded-xl",
                          "bg-surface-200 border border-border"
                        )}
                      >
                        <BookOpen className="w-5 h-5 text-primary mb-1" />
                        <p className="text-2xl font-bold text-foreground">
                          {isLoadingStats ? "..." : githubStats?.publicRepos ?? "0"}
                        </p>
                        <p className="text-xs text-muted-foreground">Repositories</p>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={cn(
                          "flex flex-col items-center gap-1 p-4 rounded-xl",
                          "bg-surface-200 border border-border"
                        )}
                      >
                        <Star className="w-5 h-5 text-amber-500 mb-1" />
                        <p className="text-2xl font-bold text-foreground">
                          {isLoadingStats ? "..." : githubStats?.totalStars ?? "0"}
                        </p>
                        <p className="text-xs text-muted-foreground">Total Stars</p>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className={cn(
                          "flex flex-col items-center gap-1 p-4 rounded-xl",
                          "bg-surface-200 border border-border"
                        )}
                      >
                        <Code2 className="w-5 h-5 text-blue-500 mb-1" />
                        <p className="text-2xl font-bold text-foreground">
                          {isLoadingStats ? "..." : githubStats?.languageCount ?? "0"}
                        </p>
                        <p className="text-xs text-muted-foreground">Languages</p>
                      </motion.div>
                    </div>

                    {/* Languages Used */}
                    {githubStats?.languages && githubStats.languages.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm font-medium text-foreground mb-2">Languages</p>
                        <div className="flex flex-wrap gap-2">
                          {githubStats.languages.slice(0, 8).map((lang, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                          {githubStats.languages.length > 8 && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              +{githubStats.languages.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Top Repositories */}
                    {githubStats?.topRepos && githubStats.topRepos.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-foreground mb-2">Top Repositories</p>
                        <div className="space-y-2">
                          {githubStats.topRepos.slice(0, 3).map((repo, idx) => (
                            <motion.a
                              key={repo.name}
                              href={repo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + idx * 0.1 }}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg",
                                "bg-surface-200 border border-border",
                                "hover:bg-surface-300 hover:border-primary/30 transition-colors"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{repo.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{repo.description}</p>
                              </div>
                              <div className="flex items-center gap-3 ml-2">
                                {repo.language && (
                                  <span className="text-xs text-muted-foreground">{repo.language}</span>
                                )}
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="w-3 h-3" />
                                  {repo.stars}
                                </div>
                              </div>
                            </motion.a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Stats */}
                    <div className="flex justify-center gap-6 py-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          <strong className="text-foreground">
                            {isLoadingStats ? "..." : githubStats?.followers ?? "0"}
                          </strong>{" "}
                          followers
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <GitFork className="w-4 h-4" />
                        <span>
                          <strong className="text-foreground">
                            {isLoadingStats ? "..." : githubStats?.totalForks ?? "0"}
                          </strong>{" "}
                          forks
                        </span>
                      </div>
                    </div>
                  </ModalContent>

                  <ModalFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const backdrop = document.querySelector('.fixed.inset-0.z-50');
                        if (backdrop) (backdrop as HTMLElement).click();
                      }}
                    >
                      Maybe Later
                    </Button>
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => window.open(GITHUB_REPO_URL, "_blank")}
                    >
                      <FaGithub className="w-4 h-4 mr-2" />
                      Visit GitHub
                    </Button>
                  </ModalFooter>
                </ModalBody>
              </Modal>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No projects to display yet. Add some in the admin panel.</p>
          </div>
        )}
      </div>
    </section>
  );
}