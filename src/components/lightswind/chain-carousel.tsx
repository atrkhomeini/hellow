"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import {
  LucideIcon,
  Search,
  X,
  Code2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// --- Core Data Interface ---
export interface ChainItem {
  id: string | number;
  name: string;
  icon: LucideIcon;
  details?: string;
  logo?: string;
  category?: string;
  color?: string;
}

// --- Internal Animated Type ---
type AnimatedChainItem = ChainItem & {
  distanceFromCenter: number;
  originalIndex: number;
};

// --- Component Props Interfaces ---

interface CarouselItemProps {
  chain: AnimatedChainItem;
  side: "left" | "right";
}

interface ChainCarouselProps {
  items: ChainItem[];
  scrollSpeedMs?: number;
  visibleItemCount?: number;
  className?: string;
  onChainSelect?: (chainId: ChainItem["id"], chainName: string) => void;
}

// --- Helper Components ---

const CarouselItemCard: React.FC<CarouselItemProps> = ({ 
  chain, 
  side 
}) => {
  const { distanceFromCenter, id, name, details, logo, icon: FallbackIcon, color } = chain;
  const [isHovered, setIsHovered] = useState(false);
  
  const IconComponent = FallbackIcon || Code2;
  
  const distance = Math.abs(distanceFromCenter);
  const opacity = 1 - distance / 4;
  const scale = 1 - distance * 0.1;
  const yOffset = distanceFromCenter * 90;
  const xOffset = side === "left" ? -distance * 50 : distance * 50;

  return (
    <motion.div
      className={cn(
        "absolute flex items-center gap-4 px-6 py-3 rounded-xl cursor-pointer",
        "transition-all duration-500 ease-out",
        side === "left" ? "flex-row-reverse" : "flex-row"
      )}
      style={{
        backgroundColor: isHovered ? "rgba(38, 38, 38, 0.6)" : "transparent",
        backdropFilter: isHovered ? "blur(8px)" : "none",
        boxShadow: isHovered 
          ? "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 255, 255, 0.03)"
          : "none",
        border: isHovered 
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid transparent",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        opacity,
        scale,
        y: yOffset,
        x: xOffset,
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* Icon/Logo Circle - Neutral Dark */}
      <motion.div 
        className="rounded-full p-2.5 border border-white/10"
        style={{ 
          backgroundColor: "rgba(30, 30, 30, 0.9)",
        }}
        animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {logo ? (
          <img 
            src={logo} 
            alt={`${name} logo`} 
            className="size-8 rounded-full object-contain" 
          />
        ) : (
          <IconComponent className="size-8 text-white/80" />
        )}
      </motion.div>

      {/* Text Content */}
      <div className={cn(
        "flex flex-col mx-4 transition-opacity duration-300",
        side === "left" ? "text-right" : "text-left",
        isHovered ? "opacity-100" : "opacity-70"
      )}>
        <span className="text-md lg:text-lg font-semibold text-foreground whitespace-nowrap">
          {name}
        </span>
        <span className="text-xs lg:text-sm text-muted-foreground">{details}</span>
      </div>
    </motion.div>
  );
};

// --- Main Component ---

const ChainCarousel: React.FC<ChainCarouselProps> = ({
  items,
  scrollSpeedMs = 1500,
  visibleItemCount = 9,
  className = "",
  onChainSelect,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const rightSectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rightSectionRef, { margin: "-100px 0px -100px 0px" });
  const totalItems = items.length;

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || totalItems === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, scrollSpeedMs);

    return () => clearInterval(interval);
  }, [isPaused, totalItems, scrollSpeedMs]);

  // Scroll listener to pause carousel
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      setIsPaused(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsPaused(false);
      }, 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Memoized function for carousel items
  const getVisibleItems = useCallback((): AnimatedChainItem[] => {
    const visibleItems: AnimatedChainItem[] = [];
    if (totalItems === 0) return [];

    const itemsToShow = visibleItemCount % 2 === 0 ? visibleItemCount + 1 : visibleItemCount;
    const half = Math.floor(itemsToShow / 2);

    for (let i = -half; i <= half; i++) {
      let index = currentIndex + i;
      if (index < 0) index += totalItems;
      if (index >= totalItems) index -= totalItems;

      visibleItems.push({
        ...items[index],
        originalIndex: index,
        distanceFromCenter: i,
      });
    }
    return visibleItems;
  }, [currentIndex, items, totalItems, visibleItemCount]);

  // Filtered list for search dropdown
  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // Handler for selecting an item
  const handleSelectChain = (id: ChainItem["id"], name: string) => {
    const index = items.findIndex((c) => c.id === id);
    if (index !== -1) {
      setCurrentIndex(index);
      setIsPaused(true);
      if (onChainSelect) {
        onChainSelect(id, name);
      }
    }
    setSearchTerm(name);
    setShowDropdown(false);
  };

  const currentItem = items[currentIndex];

  // Get visible items once for both carousels
  const visibleItems = getVisibleItems();

  return (
    <div className={cn("space-y-20", className)}>
      <div className="flex flex-col xl:flex-row max-w-7xl mx-auto px-4 md:px-8 gap-12 justify-center items-center">
        
        {/* Left Section - Carousel */}
        <motion.div
          className="relative w-full max-w-md xl:max-w-2xl h-[450px] flex items-center justify-center hidden xl:flex -left-14"
          onMouseEnter={() => !searchTerm && setIsPaused(true)}
          onMouseLeave={() => !searchTerm && setIsPaused(false)}
          initial={{ x: "-100%", opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ type: "spring", stiffness: 80, damping: 20, duration: 0.8 }}
        >
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-0 h-1/4 w-full bg-gradient-to-b from-surface-200 to-transparent"></div>
            <div className="absolute bottom-0 h-1/4 w-full bg-gradient-to-t from-surface-200 to-transparent"></div>
          </div>

          {visibleItems.map((chain, idx) => (
            <CarouselItemCard 
              key={`left-${chain.id}-${idx}`} 
              chain={chain} 
              side="left" 
            />
          ))}
        </motion.div>

        {/* Middle Section - Text and Search */}
        <div className="flex flex-col text-center gap-4 max-w-md">
          {currentItem && (
            <div className="flex flex-col items-center justify-center gap-0 mt-4">
              {/* Current Item Icon - Neutral */}
              <motion.div 
                className="p-3 rounded-full border border-white/10"
                style={{ backgroundColor: "rgba(30, 30, 30, 0.9)" }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255, 255, 255, 0.05)",
                    "0 0 30px rgba(255, 255, 255, 0.08)",
                    "0 0 20px rgba(255, 255, 255, 0.05)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {currentItem.logo ? (
                  <img 
                    src={currentItem.logo} 
                    alt={`${currentItem.name} logo`} 
                    className="size-12 rounded-full object-contain" 
                  />
                ) : (
                  <Code2 className="size-8 text-white/80" />
                )}
              </motion.div>
              
              <h3 className="text-xl xl:text-2xl font-bold text-foreground mt-3">
                {currentItem.name}
              </h3>
              <p className="text-sm xl:text-lg text-muted-foreground">
                {currentItem.details || currentItem.category}
              </p>
            </div>
          )}

          {/* Search Bar */}
          <div className="mt-6 relative max-w-lg mx-auto xl:mx-0">
            <div className="px-3 flex items-center relative">
              <Input
                type="text"
                value={searchTerm}
                placeholder="Search skills..."
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  setShowDropdown(val.length > 0);
                  if (val === "") setIsPaused(false);
                }}
                onFocus={() => {
                  if (searchTerm.length > 0) setShowDropdown(true);
                  setIsPaused(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowDropdown(false), 200);
                }}
                className="flex-grow bg-background border-border rounded-full pr-10 pl-10 py-2 focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all"
              />
              <Search className="absolute text-muted-foreground w-5 h-5 left-6 pointer-events-none" />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setShowDropdown(false);
                    setIsPaused(false);
                  }}
                  className="absolute right-6 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown - Neutral */}
            {showDropdown && filteredItems.length > 0 && (
              <div 
                className="absolute left-0 right-0 mt-2 bg-card rounded-xl border border-white/10 z-20 max-h-60 overflow-y-auto"
                style={{
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
                }}
              >
                {filteredItems.slice(0, 10).map((chain) => (
                  <div
                    key={`dropdown-${chain.id}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectChain(chain.id, chain.name);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 rounded-lg m-2",
                      "hover:bg-white/5"
                    )}
                  >
                    {/* Neutral icon container */}
                    <div 
                      className="rounded-full p-1.5 border border-white/10"
                      style={{ backgroundColor: "rgba(30, 30, 30, 0.9)" }}
                    >
                      {chain.logo ? (
                        <img 
                          src={chain.logo} 
                          alt={`${chain.name} logo`} 
                          className="size-6 rounded-full object-cover" 
                        />
                      ) : (
                        <Code2 size={24} className="text-white/80" />
                      )}
                    </div>
                    <span className="text-foreground font-medium">{chain.name}</span>
                    <span className="ml-auto text-sm text-muted-foreground capitalize">{chain.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Carousel */}
        <motion.div
          ref={rightSectionRef}
          className="relative w-full max-w-md xl:max-w-2xl h-[450px] flex items-center justify-center -right-14"
          onMouseEnter={() => !searchTerm && setIsPaused(true)}
          onMouseLeave={() => !searchTerm && setIsPaused(false)}
          initial={{ x: "100%", opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ type: "spring", stiffness: 80, damping: 20, duration: 0.8 }}
        >
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-0 h-1/4 w-full bg-gradient-to-b from-surface-200 to-transparent"></div>
            <div className="absolute bottom-0 h-1/4 w-full bg-gradient-to-t from-surface-200 to-transparent"></div>
          </div>

          {visibleItems.map((chain, idx) => (
            <CarouselItemCard 
              key={`right-${chain.id}-${idx}`} 
              chain={chain} 
              side="right" 
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ChainCarousel;