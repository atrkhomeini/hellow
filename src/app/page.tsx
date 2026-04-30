"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut, signIn } from "next-auth/react";
import { Home, Code2, Briefcase, FolderKanban, Heart, Mail, Settings, LogOut, Lock, Loader2, User, Menu, X } from "lucide-react";
import { HeroSection } from "@/components/sections/hero-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { TasteSection } from "@/components/sections/taste-section";
import { ContactSection } from "@/components/sections/contact-section";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { usePortfolioStore } from "@/store/portfolio-store";
import Loader from "@/components/kokonutui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DynamicNavigation } from "@/components/lightswind/dynamic-navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const navLinks = [
  { id: "hero", label: "Home", href: "#hero", icon: <Home className="w-4 h-4" /> },
  { id: "skills", label: "Skills", href: "#skills", icon: <Code2 className="w-4 h-4" /> },
  { id: "experience", label: "Experience", href: "#experience", icon: <Briefcase className="w-4 h-4" /> },
  { id: "projects", label: "Projects", href: "#projects", icon: <FolderKanban className="w-4 h-4" /> },
  { id: "taste", label: "My Taste", href: "#taste", icon: <Heart className="w-4 h-4" /> },
  { id: "contact", label: "Contact", href: "#contact", icon: <Mail className="w-4 h-4" /> },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const { isLoading, fetchAllData, isAdminMode, setAdminMode } = usePortfolioStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (session) {
      setAdminMode(true);
      setLoginDialogOpen(false);
    } else {
      setAdminMode(false);
      setShowAdmin(false);
    }
  }, [session, setAdminMode]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => document.getElementById(link.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navLinks[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const result = await signIn("credentials", {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome!",
          description: "Successfully logged in as admin",
        });
        setLoginForm({ email: "", password: "" });
        setLoginDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-4">
          {/* Main Navigation */}
          <DynamicNavigation
            links={navLinks}
            activeLink={activeSection}
            onLinkClick={scrollToSection}
            glowIntensity={8}
            highlightColor="rgba(62, 207, 142, 0.15)"
            className="hidden md:flex"
          />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 rounded-full bg-background/80 backdrop-blur-md border border-border hover:border-primary/50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            {isAdminMode ? (
              <>
                <Button
                  onClick={() => setShowAdmin(!showAdmin)}
                  variant={showAdmin ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full",
                    showAdmin && "bg-primary text-primary-foreground"
                  )}
                >
                  <Settings className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{showAdmin ? "View Site" : "Admin"}</span>
                </Button>

                <Button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setLoginDialogOpen(true)}
                variant="outline"
                size="sm"
                className="rounded-full gap-2"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Login</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="md:hidden absolute top-14 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm"
            >
              <DynamicNavigation
                links={navLinks}
                activeLink={activeSection}
                onLinkClick={(id) => {
                  scrollToSection(id);
                  setMobileMenuOpen(false);
                }}
                glowIntensity={8}
                highlightColor="rgba(62, 207, 142, 0.15)"
                showLabelsOnMobile
                className="flex-col py-4"
              />
              
              {/* Mobile Login Button */}
              {!isAdminMode && (
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginDialogOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 rounded-full"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Admin Login
            </DialogTitle>
            <DialogDescription>
              Enter your credentials to access the admin dashboard.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                required
                className="bg-surface-200 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                required
                className="bg-surface-200 border-border"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLoginDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {showAdmin && isAdminMode ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-20"
          >
            <AdminDashboard />
          </motion.div>
        ) : (
          <motion.main
            key="portfolio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeroSection />
            <SkillsSection />
            <ExperienceSection />
            <ProjectsSection />
            <TasteSection />
            <ContactSection />

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-border bg-surface-100">
              <div className="max-w-6xl mx-auto text-center">
                <p className="text-muted-foreground text-sm">
                  © {new Date().getFullYear()} Portfolio. Built with Next.js and Coffee
                </p>
              </div>
            </footer>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}