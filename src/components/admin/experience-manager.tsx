"use client";

import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Plus, Trash2, GripVertical, Calendar, Building2, ExternalLink, List, X } from "lucide-react";
import { usePortfolioStore, Experience } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Helper: Parse description string to array of bullet points
function parseDescriptionToBullets(description: string): string[] {
  if (!description) return [""];
  
  const lines = description
    .split(/\n+/)
    .map(line => line.replace(/^[-•*]\s*/, "").trim())
    .filter(line => line.length > 0);
  
  return lines.length > 0 ? lines : [""];
}

// Helper: Convert array of bullets to description string
function bulletsToDescription(bullets: string[]): string {
  return bullets
    .filter(b => b.trim().length > 0)
    .map(b => `- ${b.trim()}`)
    .join("\n\n");
}

// Bullet Points Editor Component
function BulletPointsEditor({
  bullets,
  onChange,
}: {
  bullets: string[];
  onChange: (bullets: string[]) => void;
}) {
  const addBullet = () => {
    onChange([...bullets, ""]);
  };

  const removeBullet = (index: number) => {
    if (bullets.length > 1) {
      const newBullets = bullets.filter((_, i) => i !== index);
      onChange(newBullets);
    }
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    onChange(newBullets);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <List className="w-4 h-4" />
          Description (Bullet Points)
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBullet}
          className="h-7 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Point
        </Button>
      </div>
      
      <div className="space-y-2">
        {bullets.map((bullet, index) => (
          <div key={index} className="flex items-start gap-2 group">
            <span className="w-6 h-9 flex items-center justify-center text-muted-foreground text-sm font-medium shrink-0">
              {index + 1}.
            </span>
            <Input
              value={bullet}
              onChange={(e) => updateBullet(index, e.target.value)}
              placeholder="Describe your achievement or responsibility..."
              className="flex-1"
            />
            {bullets.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeBullet(index)}
                className="h-9 w-9 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Tip: Each point will be displayed as a bullet point in your portfolio.
      </p>
    </div>
  );
}

export function ExperienceManager() {
  const { experiences, setExperiences } = usePortfolioStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [bulletPoints, setBulletPoints] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    externalLinks: "",
    isPublished: true,
  });

  // Sort experiences by order
  const sortedExperiences = [...experiences].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Handle reorder
  const handleReorder = async (newOrder: Experience[]) => {
    setExperiences(newOrder);
    
    // Update order in database
    try {
      await fetch("/api/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experiences: newOrder.map((exp, index) => ({
            id: exp.id,
            order: index,
          })),
        }),
      });
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      externalLinks: "",
      isPublished: true,
    });
    setBulletPoints([""]);
    setEditingId(null);
  };

  const handleBulletChange = (newBullets: string[]) => {
    setBulletPoints(newBullets);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const description = bulletsToDescription(bulletPoints);

    try {
      const url = editingId ? `/api/experience/${editingId}` : "/api/experience";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          description,
        }),
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
      } else {
        const errorData = await response.json();
        toast({ 
          title: "Error", 
          description: errorData.error || "Failed to save", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    
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
        toast({ 
          title: "Success", 
          description: isPublished ? "Experience published" : "Experience unpublished" 
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const openEdit = (exp: Experience) => {
    setFormData({
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate || "",
      isCurrent: exp.isCurrent,
      externalLinks: exp.externalLinks || "",
      isPublished: exp.isPublished,
    });
    
    const parsedBullets = parseDescriptionToBullets(exp.description);
    setBulletPoints(parsedBullets);
    
    setEditingId(exp.id);
    setIsDialogOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Experience</h2>
          <p className="text-muted-foreground">Manage your career timeline (drag to reorder)</p>
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
                <Label>Job Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>
              
              <div>
                <Label>Company *</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Google"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="text"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    placeholder="e.g., Feb 2024"
                    required
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="text"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    placeholder="e.g., Mar 2024"
                    disabled={formData.isCurrent}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isCurrent"
                  checked={formData.isCurrent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isCurrent: checked as boolean, endDate: "" })
                  }
                />
                <Label htmlFor="isCurrent" className="cursor-pointer">
                  I currently work here
                </Label>
              </div>
              
              {/* Bullet Points Editor */}
              <BulletPointsEditor
                bullets={bulletPoints}
                onChange={handleBulletChange}
              />
              
              <div className="flex items-center gap-2">
                <Switch
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPublished: checked })
                  }
                />
                <Label htmlFor="isPublished" className="cursor-pointer">
                  Published (visible on portfolio)
                </Label>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
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

      {/* Experience List with Drag & Drop */}
      <Reorder.Group
        axis="y"
        values={sortedExperiences}
        onReorder={handleReorder}
        className="space-y-3"
      >
        {sortedExperiences.map((exp) => (
          <Reorder.Item
            key={exp.id}
            value={exp}
            className={cn(
              "p-4 rounded-lg border border-border bg-card",
              "hover:border-primary/30 transition-colors cursor-grab active:cursor-grabbing"
            )}
          >
            <div className="flex items-start gap-4">
              <GripVertical className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-foreground">{exp.title}</h3>
                  {exp.isCurrent && (
                    <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                      Current
                    </span>
                  )}
                  {!exp.isPublished && (
                    <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                      Draft
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <Building2 className="w-4 h-4" />
                  {exp.company}
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  {exp.startDate}
                  {" - "}
                  {exp.isCurrent ? "Present" : exp.endDate || ""}
                </div>
                
                {/* Preview bullet points */}
                {exp.description && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    <ul className="list-disc list-inside space-y-1">
                      {parseDescriptionToBullets(exp.description)
                        .slice(0, 2)
                        .map((bullet, i) => (
                          <li key={i} className="truncate">
                            {bullet}
                          </li>
                        ))}
                      {parseDescriptionToBullets(exp.description).length > 2 && (
                        <li className="text-primary">
                          +{parseDescriptionToBullets(exp.description).length - 2} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={exp.isPublished}
                  onCheckedChange={(checked) => handleTogglePublished(exp.id, checked)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(exp);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(exp.id);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {experiences.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
          <p>No experience entries yet.</p>
          <p className="text-sm mt-1">Click "Add Experience" to get started.</p>
        </div>
      )}
    </div>
  );
}