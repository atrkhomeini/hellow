"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut, signIn } from "next-auth/react";
import { Home, Code2, Briefcase, FolderKanban, Heart, Mail, Settings, LogOut, Lock, Loader2, User } from "lucide-react";
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
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", link: "#hero", icon: <Home className="w-4 h-4" /> },
  { name: "Skills", link: "#skills", icon: <Code2 className="w-4 h-4" /> },
  { name: "Experience", link: "#experience", icon: <Briefcase className="w-4 h-4" /> },
  { name: "Projects", link: "#projects", icon: <FolderKanban className="w-4 h-4" /> },
  { name: "Taste", link: "#taste", icon: <Heart className="w-4 h-4" /> },
  { name: "Contact", link: "#contact", icon: <Mail className="w-4 h-4" /> },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const { isLoading, fetchAllData, isAdminMode, setAdminMode } = usePortfolioStore();
  const [showAdmin, setShowAdmin] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      const sections = navItems.map((item) => document.getElementById(item.link.replace("#", "")));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].link.replace("#", ""));
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
    setIsMobileMenuOpen(false);
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
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems
            items={navItems}
            activeItem={activeSection}
            onItemClick={scrollToSection}
          />
          <div className="flex items-center gap-2">
            {isAdminMode ? (
              <>
                <NavbarButton
                  variant={showAdmin ? "primary" : "secondary"}
                  onClick={() => setShowAdmin(!showAdmin)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {showAdmin ? "View Site" : "Admin"}
                </NavbarButton>
                <NavbarButton variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </NavbarButton>
              </>
            ) : (
              <NavbarButton variant="secondary" onClick={() => setLoginDialogOpen(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Admin Login
              </NavbarButton>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item) => (
              <a
                key={item.link}
                href={item.link}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.link.replace("#", ""));
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  activeSection === item.link.replace("#", "")
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface-300"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </a>
            ))}
            
            <div className="flex w-full flex-col gap-2 mt-4 pt-4 border-t border-border">
              {isAdminMode ? (
                <>
                  <NavbarButton
                    variant="primary"
                    className="w-full justify-center"
                    onClick={() => {
                      setShowAdmin(!showAdmin);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {showAdmin ? "View Site" : "Admin"}
                  </NavbarButton>
                  <NavbarButton
                    variant="secondary"
                    className="w-full justify-center"
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </NavbarButton>
                </>
              ) : (
                <NavbarButton
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => {
                    setLoginDialogOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Admin Login
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

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
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
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
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
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
                  © {new Date().getFullYear()} Portfolio. Built with Next.js and ❤️
                </p>
              </div>
            </footer>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}