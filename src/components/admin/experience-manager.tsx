"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, GripVertical, Calendar, Building2, MapPin, ExternalLink } from "lucide-react";
import { usePortfolioStore, Experience } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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

export function ExperienceManager() {
  const { experiences, setExperiences } = usePortfolioStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
    imageUrl: "",
    videoUrl: "",
    projectUrl: "",
    isPublished: true,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
      imageUrl: "",
      videoUrl: "",
      projectUrl: "",
      isPublished: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/experience/${editingId}` : "/api/experience";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedExperience = await response.json();

        if (editingId) {
          setExperiences(
            experiences.map((exp) =>
              exp.id === editingId ? savedExperience : exp
            )
          );
        } else {
          setExperiences([...experiences, savedExperience]);
        }

        setIsDialogOpen(false);
        resetForm();
        toast({
          title: "Success",
          description: editingId ? "Experience updated" : "Experience added",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/experience/${id}`, { method: "DELETE" });

      if (response.ok) {
        setExperiences(experiences.filter((exp) => exp.id !== id));
        toast({ title: "Success", description: "Experience deleted" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleTogglePublished = async (id: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/experience/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished }),
      });

      if (response.ok) {
        setExperiences(
          experiences.map((exp) =>
            exp.id === id ? { ...exp, isPublished } : exp
          )
        );
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const openEdit = (exp: Experience) => {
    setFormData({
      title: exp.title,
      company: exp.company,
      location: exp.location || "",
      startDate: exp.startDate.split("T")[0],
      endDate: exp.endDate ? exp.endDate.split("T")[0] : "",
      isCurrent: exp.isCurrent,
      description: exp.description,
      imageUrl: exp.imageUrl || "",
      videoUrl: exp.videoUrl || "",
      projectUrl: exp.projectUrl || "",
      isPublished: exp.isPublished,
    });
    setEditingId(exp.id);
    setIsDialogOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Experience</h2>
          <p className="text-muted-foreground">Manage your career timeline</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Experience" : "Add Experience"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Job Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.isCurrent}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isCurrent"
                  checked={formData.isCurrent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isCurrent: checked as boolean })
                  }
                />
                <Label htmlFor="isCurrent">I currently work here</Label>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label>Project URL</Label>
                <Input
                  value={formData.projectUrl}
                  onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                  placeholder="https://..."
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

      {/* Experience List */}
      <div className="space-y-4">
        {experiences.map((exp) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-lg border border-border bg-card",
              "hover:border-primary/30 transition-colors"
            )}
          >
            <div className="flex items-start gap-4">
              <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab mt-1" />

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{exp.title}</h3>
                  {exp.isCurrent && (
                    <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <Building2 className="w-4 h-4" />
                  {exp.company}
                  {exp.location && (
                    <>
                      <span>•</span>
                      <MapPin className="w-4 h-4" />
                      {exp.location}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(exp.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                  {" - "}
                  {exp.isCurrent
                    ? "Present"
                    : exp.endDate
                    ? new Date(exp.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </div>
                {exp.projectUrl && (
                  <a
                    href={exp.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary mt-2 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Project
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={exp.isPublished}
                  onCheckedChange={(checked) => handleTogglePublished(exp.id, checked)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(exp)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(exp.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {experiences.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No experience entries yet. Add your first one to get started.</p>
        </div>
      )}
    </div>
  );
}
