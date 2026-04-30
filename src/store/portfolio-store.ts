import { create } from "zustand";

// Types
export interface Profile {
  id: string;
  name: string;
  headline: string;
  bio: string;
  photoUrl: string | null;
  cvUrl: string | null;
}

export interface Skill {
  id: string;
  name: string;
  category: "soft" | "hard" | "language";
  iconName: string | null;
  iconUrl: string | null;
  color: string | null;
  order: number;
  isActive: boolean;
  projectIds?: string[];
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
  mediaUrls: string[];
  externalLinks: { title: string; url: string }[];
  order: number;
  isPublished: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: "past" | "in-development";
  imageUrl: string | null;
  mediaUrls: string[];
  projectUrl: string | null;
  order: number;
  isPublished: boolean;
  skills: { id: string; name: string; category: string; iconName?: string; color?: string }[];
}

export interface TasteItem {
  id: string;
  title: string;
  category: "music" | "brewing" | "fitness";
  description: string | null;
  content: string | null;
  embedUrl: string | null;
  imageUrl: string | null;
  order: number;
  isPublished: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  order: number;
  isPublished: boolean;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// Store State
interface PortfolioState {
  // Data
  profile: Profile | null;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  tasteItems: TasteItem[];
  socialLinks: SocialLink[];
  messages: Message[];

  // UI State
  isLoading: boolean;
  isAdminMode: boolean;
  currentSection: string;

  // Actions
  setProfile: (profile: Profile) => void;
  setSkills: (skills: Skill[]) => void;
  setExperiences: (experiences: Experience[]) => void;
  setProjects: (projects: Project[]) => void;
  setTasteItems: (tasteItems: TasteItem[]) => void;
  setSocialLinks: (socialLinks: SocialLink[]) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setAdminMode: (isAdmin: boolean) => void;
  setCurrentSection: (section: string) => void;

  // Fetch Actions
  fetchAllData: () => Promise<void>;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  // Initial State
  profile: null,
  skills: [],
  experiences: [],
  projects: [],
  tasteItems: [],
  socialLinks: [],
  messages: [],
  isLoading: true,
  isAdminMode: false,
  currentSection: "hero",

  // Actions
  setProfile: (profile) => set({ profile }),
  setSkills: (skills) => set({ skills }),
  setExperiences: (experiences) => set({ experiences }),
  setProjects: (projects) => set({ projects }),
  setTasteItems: (tasteItems) => set({ tasteItems }),
  setSocialLinks: (socialLinks) => set({ socialLinks }),
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  setAdminMode: (isAdminMode) => set({ isAdminMode }),
  setCurrentSection: (currentSection) => set({ currentSection }),

  // Fetch All Data
  fetchAllData: async () => {
    set({ isLoading: true });
    try {
      const [
        profileRes,
        skillsRes,
        experiencesRes,
        projectsRes,
        tasteItemsRes,
        socialLinksRes,
      ] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/skills"),
        fetch("/api/experience"),
        fetch("/api/projects"),
        fetch("/api/taste-items"),
        fetch("/api/social-links"),
      ]);

      const profile = await profileRes.json();
      const skills = await skillsRes.json();
      const experiences = await experiencesRes.json();
      const projects = await projectsRes.json();
      const tasteItems = await tasteItemsRes.json();
      const socialLinks = await socialLinksRes.json();

      set({
        profile: profile.id ? profile : null,
        skills: Array.isArray(skills) ? skills : [],
        experiences: Array.isArray(experiences) ? experiences : [],
        projects: Array.isArray(projects) ? projects : [],
        tasteItems: Array.isArray(tasteItems) ? tasteItems : [],
        socialLinks: Array.isArray(socialLinks) ? socialLinks : [],
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      set({ isLoading: false });
    }
  },
}));
