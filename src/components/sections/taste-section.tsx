"use client";

import { motion } from "framer-motion";
import { Music, Coffee, Dumbbell, Play } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { cn } from "@/lib/utils";

// BentoCard component
function BentoCard({
  title,
  icon: Icon,
  items,
  color,
  delay,
  className,
  renderContent,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ReturnType<typeof usePortfolioStore>["tasteItems"];
  color: string;
  delay: number;
  className?: string;
  renderContent?: (item: ReturnType<typeof usePortfolioStore>["tasteItems"][0]) => React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={cn(
        "relative p-6 rounded-2xl border border-border bg-card overflow-hidden",
        "group hover:border-primary/30 transition-all duration-300",
        className
      )}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${color}, transparent 70%)`,
        }}
      />

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        </div>

        <div className="flex-1">
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id}>
                  {renderContent ? (
                    renderContent(item)
                  ) : (
                    <p className="text-muted-foreground">{item.content}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground/50 text-sm">
              No content yet. Add some in the admin panel.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TasteSection() {
  const { tasteItems } = usePortfolioStore();

  const musicItems = tasteItems.filter(
    (t) => t.category === "music" && t.isPublished
  );
  const brewingItems = tasteItems.filter(
    (t) => t.category === "brewing" && t.isPublished
  );
  const fitnessItems = tasteItems.filter(
    (t) => t.category === "fitness" && t.isPublished
  );

  return (
    <section
      id="taste"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-200"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            My Taste
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A glimpse into what I enjoy outside of coding
          </p>
        </motion.div>

        {/* Apple Music Section - Full Width */}
        {musicItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-pink-500/20">
                <Music className="w-5 h-5 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Now Playing</h3>
            </div>

            <div className="space-y-6">
              {musicItems.map((item) => (
                <div
                  key={item.id}
                  className="relative p-6 rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-300"
                >
                  {item.embedUrl ? (
                    <iframe
                      allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                      frameBorder="0"
                      style={{
                        width: "100%",
                        height: "500px",
                        overflow: "hidden",
                        borderRadius: "12px",
                      }}
                      sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                      src={item.embedUrl}
                    />
                  ) : (
                    <div className="flex items-center gap-4">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Play className="w-4 h-4 text-pink-500" />
                          <span className="text-xs text-pink-500 font-medium">Now Playing</span>
                        </div>
                        <h4 className="font-semibold text-foreground text-lg">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Brewing & Fitness - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Currently Brewing */}
          <BentoCard
            title="Currently Brewing"
            icon={Coffee}
            items={brewingItems}
            color="#c4a35a"
            delay={0.2}
            renderContent={(item) => (
              <div className="flex items-center gap-3">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h4 className="font-medium text-foreground truncate">{item.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                </div>
              </div>
            )}
          />

          {/* Fitness */}
          <BentoCard
            title="Fitness"
            icon={Dumbbell}
            items={fitnessItems}
            color="#3ecf8e"
            delay={0.3}
            renderContent={(item) => (
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
              </div>
            )}
          />
        </div>
      </div>
    </section>
  );
}