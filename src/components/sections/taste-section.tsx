"use client";

import { motion } from "framer-motion";
import { Music, Coffee, Dumbbell } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { BrewingCard } from "@/components/ui/brewing-card";
import { FitnessCard } from "@/components/ui/fitness-card";
import { cn } from "@/lib/utils";

// Parse structured data from content
function parseStructuredData(content: string | null): Record<string, string> {
  if (!content) return {};
  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}

// Music Player Card
function MusicCard({ item }: { item: { title: string; embedUrl: string | null } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative rounded-2xl border border-border bg-card overflow-hidden"
    >
      {item.embedUrl ? (
        <iframe
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          frameBorder="0"
          style={{
            width: "100%",
            height: "500px",
            overflow: "hidden",
            borderRadius: "16px",
          }}
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src={item.embedUrl}
        />
      ) : (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No embed URL configured
        </div>
      )}
    </motion.div>
  );
}

export function TasteSection() {
  const { tasteItems } = usePortfolioStore();

  const musicItems = tasteItems.filter((t) => t.category === "music" && t.isPublished);
  const brewingItems = tasteItems.filter((t) => t.category === "brewing" && t.isPublished);
  const fitnessItems = tasteItems.filter((t) => t.category === "fitness" && t.isPublished);

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

        {/* Now Playing Section */}
        {musicItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-pink-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Now Playing</h3>
            </div>

            {musicItems.map((item) => (
              <MusicCard key={item.id} item={item} />
            ))}
          </motion.div>
        )}

        {/* Brewing & Fitness Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Currently Brewing */}
          {brewingItems.map((item) => {
            const data = parseStructuredData(item.content);
            return (
              <BrewingCard
                key={item.id}
                title={item.title}
                data={data}
              />
            );
          })}

          {/* Fitness & Analytics */}
          {fitnessItems.map((item) => {
            const data = parseStructuredData(item.content);
            return (
              <FitnessCard
                key={item.id}
                title={item.title}
                data={data}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {tasteItems.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No items to display. Add some in the admin panel.</p>
          </div>
        )}
      </div>
    </section>
  );
}