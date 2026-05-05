"use client";

import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Plus, Trash2, GripVertical, Code2, Wrench, Languages } from "lucide-react";
import { usePortfolioStore, Skill } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ui/image-upload";
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

const categories = [
  { value: "expertise", label: "Expertise", icon: Code2 },
  { value: "hard", label: "Hard Skills", icon: Wrench },
  { value: "language", label: "Languages & Frameworks", icon: Languages },
];

export function SkillsManager() {
  const { skills, setSkills } = usePortfolioStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "expertise",
    iconUrl: "",
    color: "",
    isActive: true,
  });

  // Handle reorder for a specific category
  const handleReorder = async (category: string, newOrder: Skill[]) => {
    // Update local state
    const otherSkills = skills.filter((s) => s.category !== category);
    const updatedSkills = [...otherSkills, ...newOrder];
    setSkills(updatedSkills);
    
    // Update order in database
    try {
      await fetch("/api/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: newOrder.map((skill, index) => ({
            id: skill.id,
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
      name: "",
      category: "expertise",
      iconUrl: "",
      color: "",
      isActive: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/skills/${editingId}` : "/api/skills";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedSkill = await response.json();

        if (editingId) {
          setSkills(
            skills.map((skill) =>
              skill.id === editingId ? savedSkill : skill
            )
          );
        } else {
          setSkills([...skills, savedSkill]);
        }

        setIsDialogOpen(false);
        resetForm();
        toast({
          title: "Success",
          description: editingId ? "Skill updated" : "Skill added",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/skills/${id}`, { method: "DELETE" });

      if (response.ok) {
        setSkills(skills.filter((skill) => skill.id !== id));
        toast({ title: "Success", description: "Skill deleted" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setSkills(
          skills.map((skill) =>
            skill.id === id ? { ...skill, isActive } : skill
          )
        );
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const openEdit = (skill: Skill) => {
    setFormData({
      name: skill.name,
      category: skill.category,
      iconUrl: skill.iconUrl || "",
      color: skill.color || "",
      isActive: skill.isActive,
    });
    setEditingId(skill.id);
    setIsDialogOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.icon || Code2;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Skills</h2>
          <p className="text-muted-foreground">Manage your skills and expertise (drag to reorder)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Skill" : "Add Skill"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., React, Docker, Python"
                  required
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Icon</Label>
                <ImageUpload
                  value={formData.iconUrl}
                  onChange={(url) => setFormData({ ...formData, iconUrl: url })}
                  label="Upload Icon (SVG, PNG, ICO)"
                  accept="image"
                  maxSize={2}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: Square icon (64x64 or 128x128), SVG or PNG with transparency
                </p>
              </div>

              <div>
                <Label>Brand Color (optional)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={formData.color || "#3ecf8e"}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3ecf8e"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Used for icon background in the carousel
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label>Active</Label>
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

      {/* Skills List with Drag & Drop */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categorySkills = skills
            .filter((s) => s.category === category.value)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          const Icon = category.icon;

          if (categorySkills.length === 0) return null;

          return (
            <div key={category.value}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {category.label}
                </h3>
              </div>

              <Reorder.Group
                axis="y"
                values={categorySkills}
                onReorder={(newOrder) => handleReorder(category.value, newOrder)}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {categorySkills.map((skill) => (
                  <Reorder.Item
                    key={skill.id}
                    value={skill}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border border-border bg-card",
                      "hover:border-primary/30 transition-colors cursor-grab active:cursor-grabbing"
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                    {/* Icon Preview */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: skill.color ? `${skill.color}20` : "rgba(62, 207, 142, 0.2)" }}
                    >
                      {skill.iconUrl ? (
                        <img
                          src={skill.iconUrl}
                          alt={skill.name}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <Code2 className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{skill.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{skill.category}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={skill.isActive}
                        onCheckedChange={(checked) => handleToggleActive(skill.id, checked)}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(skill);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(skill.id);
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          );
        })}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No skills yet. Add your first skill to get started.</p>
        </div>
      )}
    </div>
  );
}