"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Save, Trash2, GripVertical } from "lucide-react";
import { usePortfolioStore, Skill } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const skillCategories = [
  { value: "soft", label: "Soft Skills" },
  { value: "hard", label: "Hard Skills" },
  { value: "language", label: "Languages & Frameworks" },
];

export function SkillsManager() {
  const { skills, setSkills } = usePortfolioStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "hard",
    icon: "",
    level: 80,
    isPublished: true,
  });

  const handleAddSkill = async () => {
    if (!formData.name.trim()) return;

    try {
      const response = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newSkill = await response.json();
        setSkills([...skills, newSkill]);
        setFormData({ name: "", category: "hard", icon: "", level: 80, isPublished: true });
        setIsAdding(false);
        toast({ title: "Success", description: "Skill added successfully" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add skill", variant: "destructive" });
    }
  };

  const handleUpdateSkill = async (id: string, data: Partial<Skill>) => {
    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedSkill = await response.json();
        setSkills(skills.map((s) => (s.id === id ? updatedSkill : s)));
        setEditingId(null);
        toast({ title: "Success", description: "Skill updated successfully" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update skill", variant: "destructive" });
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      const response = await fetch(`/api/skills/${id}`, { method: "DELETE" });

      if (response.ok) {
        setSkills(skills.filter((s) => s.id !== id));
        toast({ title: "Success", description: "Skill deleted successfully" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete skill", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Skills</h2>
          <p className="text-muted-foreground">Manage your technical and soft skills</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Add Skill Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg border border-border bg-card mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Skill name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {skillCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Icon name (e.g., code, database)"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Level (0-100)"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 0 })}
              min={0}
              max={100}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSkill} className="bg-primary hover:bg-primary/90">
              Add Skill
            </Button>
          </div>
        </motion.div>
      )}

      {/* Skills List by Category */}
      {skillCategories.map((category) => {
        const categorySkills = skills.filter((s) => s.category === category.value);
        if (categorySkills.length === 0) return null;

        return (
          <div key={category.value} className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">{category.label}</h3>
            <div className="space-y-2">
              {categorySkills.map((skill) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border border-border bg-card",
                    "group hover:border-primary/30 transition-colors"
                  )}
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{skill.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        Level: {skill.level}%
                      </Badge>
                    </div>
                    {skill.icon && (
                      <span className="text-sm text-muted-foreground">Icon: {skill.icon}</span>
                    )}
                  </div>

                  <Switch
                    checked={skill.isPublished}
                    onCheckedChange={(checked) => handleUpdateSkill(skill.id, { isPublished: checked })}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {skills.length === 0 && !isAdding && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No skills yet. Add your first skill to get started.</p>
        </div>
      )}
    </div>
  );
}
