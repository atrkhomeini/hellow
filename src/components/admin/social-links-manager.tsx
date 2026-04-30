"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Mail, Phone, Globe } from "lucide-react";
import { FaGithub, FaLinkedin, FaInstagram, FaTwitter } from "react-icons/fa";
import { usePortfolioStore, SocialLink } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const platforms = [
  { value: "github", label: "GitHub", icon: FaGithub },
  { value: "linkedin", label: "LinkedIn", icon: FaLinkedin },
  { value: "email", label: "Email", icon: Mail },
  { value: "whatsapp", label: "WhatsApp", icon: Phone },
  { value: "instagram", label: "Instagram", icon: FaInstagram },
  { value: "twitter", label: "Twitter/X", icon: FaTwitter },
  { value: "website", label: "Website", icon: Globe },
];

export function SocialLinksManager() {
  const { socialLinks, setSocialLinks } = usePortfolioStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platform: "github",
    url: "",
    isPublished: true,
  });

  const resetForm = () => {
    setFormData({
      platform: "github",
      url: "",
      isPublished: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const response = await fetch("/api/social-links", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...formData }),
        });

        if (response.ok) {
          const updatedLink = await response.json();
          setSocialLinks(
            socialLinks.map((link) =>
              link.id === editingId ? updatedLink : link
            )
          );
          toast({ title: "Success", description: "Link updated" });
        }
      } else {
        const response = await fetch("/api/social-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newLink = await response.json();
          setSocialLinks([...socialLinks, newLink]);
          toast({ title: "Success", description: "Link added" });
        }
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/social-links?id=${id}`, { method: "DELETE" });

      if (response.ok) {
        setSocialLinks(socialLinks.filter((link) => link.id !== id));
        toast({ title: "Success", description: "Link deleted" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const openEdit = (link: SocialLink) => {
    setFormData({
      platform: link.platform,
      url: link.url,
      isPublished: link.isPublished,
    });
    setEditingId(link.id);
    setIsDialogOpen(true);
  };

  const getPlatformIcon = (platform: string) => {
    const plat = platforms.find((p) => p.value === platform);
    return plat?.icon || Globe;
  };

  const getPlaceholder = (platform: string) => {
    switch (platform) {
      case "github":
        return "https://github.com/username";
      case "linkedin":
        return "https://linkedin.com/in/username";
      case "email":
        return "mailto:your@email.com";
      case "whatsapp":
        return "https://wa.me/1234567890";
      case "instagram":
        return "https://instagram.com/username";
      case "twitter":
        return "https://twitter.com/username";
      default:
        return "https://example.com";
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Social Links</h2>
          <p className="text-muted-foreground">Manage your social media links</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Link" : "Add Link"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((plat) => {
                      const Icon = plat.icon;
                      return (
                        <SelectItem key={plat.value} value={plat.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {plat.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder={getPlaceholder(formData.platform)}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPublished: checked })
                  }
                />
                <Label>Published</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingId ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Links List */}
      <div className="space-y-3">
        {socialLinks.map((link) => {
          const Icon = getPlatformIcon(link.platform);

          return (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg border border-border bg-card",
                "hover:border-primary/30 transition-colors"
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-surface-300 flex items-center justify-center">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground capitalize">
                    {link.platform}
                  </span>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {link.url}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={link.isPublished}
                  onCheckedChange={async (checked) => {
                    const response = await fetch("/api/social-links", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: link.id, isPublished: checked }),
                    });
                    if (response.ok) {
                      setSocialLinks(
                        socialLinks.map((l) =>
                          l.id === link.id ? { ...l, isPublished: checked } : l
                        )
                      );
                    }
                  }}
                />
                <Button variant="outline" size="sm" onClick={() => openEdit(link)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(link.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {socialLinks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No social links yet. Add your first link to get started.</p>
        </div>
      )}
    </div>
  );
}