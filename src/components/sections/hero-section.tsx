"use client";

import { motion } from "framer-motion";
import { Download, Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { GradientSlideButton } from "@/components/ui/gradient-slide-button";
import { BlurReveal } from "@/components/ui/blur-reveal";
import { TypingText } from "@/components/ui/typing-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePortfolioStore } from "@/store/portfolio-store";
import AsciiWave from "@/components/lightswind/ascii-wave";
import { cn } from "@/lib/utils";

// Default roles for typing effect
const defaultRoles = [
  "Data Scientist",
  "Data Analyst",
  "Business Intelligence Analyst",
];

export function HeroSection() {
  const { profile, socialLinks } = usePortfolioStore();

  // Get roles from profile headline or use defaults
  const roles = profile?.headline 
    ? [profile.headline, ...defaultRoles.filter(r => r !== profile.headline)].slice(0, 3)
    : defaultRoles;

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return <FaGithub className="w-5 h-5" />;
      case "linkedin":
        return <FaLinkedin className="w-5 h-5" />;
      case "email":
        return <Mail className="w-5 h-5" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* ASCII Wave Background */}
      <div className="absolute inset-0 z-0">
        <AsciiWave 
          color="#3ecf8e" 
          speed={0.8}
          className="opacity-20"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background z-10 pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] z-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Main Content */}
      <div className="relative z-20 max-w-5xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          
          {/* Left: Profile Image */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, x: -50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-shrink-0"
          >
            <div className="relative">
              {/* Glow effect behind avatar */}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-110" />
              
              <Avatar className="w-40 h-40 sm:w-48 sm:h-48 border-4 border-primary/30 relative">
                {profile?.photoUrl ? (
                  <AvatarImage
                    src={profile.photoUrl}
                    alt={profile?.name || "Profile"}
                    className="object-cover"
                  />
                ) : (
                  <AvatarImage src="/logo.svg" alt="Profile" className="object-cover" />
                )}
                <AvatarFallback className="text-4xl bg-primary/10">
                  {profile?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              {/* Online indicator */}
              <div className="absolute bottom-3 right-3 w-6 h-6 bg-primary rounded-full border-4 border-background" />
            </div>
          </motion.div>

          {/* Right: Name, Role, Description */}
          <div className="flex-1 text-center lg:text-left">
            {/* Role - Typing Effect */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-2"
            >
              <TypingText
                texts={roles}
                speed={80}
                delay={3000}
                className="text-lg sm:text-xl text-primary font-medium"
                cursorClassName="text-primary"
              />
            </motion.div>

            {/* Name - Blur Effect */}
            <BlurReveal delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight">
                {profile?.name || "Your Name"}
              </h1>
            </BlurReveal>

            {/* Description - Blur Effect */}
            <BlurReveal delay={0.4}>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                {profile?.bio ||
                  "Passionate developer creating beautiful and functional web applications."}
              </p>
            </BlurReveal>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              {/* Download CV - Gradient Slide Button */}
              {profile?.cvUrl && (
                <GradientSlideButton
                  onClick={() => window.open(profile.cvUrl!, "_blank")}
                  className="text-base"
                  colorFrom="#ededed"
                  colorTo="#3ecf8e"
                >
                  <Download className="w-5 h-5" />
                  Download CV
                </GradientSlideButton>
              )}

              {/* Social Links */}
              {socialLinks.filter(l => l.isPublished).map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full",
                    "border border-border hover:border-primary/50",
                    "text-muted-foreground hover:text-foreground",
                    "transition-all duration-300 hover:bg-surface-300"
                  )}
                >
                  {getSocialIcon(link.platform)}
                  <span className="hidden sm:inline capitalize">{link.platform}</span>
                </a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}