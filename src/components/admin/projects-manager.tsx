"use client";

import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Plus, Trash2, GripVertical, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { usePortfolioStore, Project } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function ProjectsManager() {
  const { projects, setProjects, skills } = usePortfolioStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "past",
    imageUrl: "",
    videoUrl: "",
    projectUrl: "",
    githubUrl: "",
    skillIds: [] as string[],
    isPublished: true,
  });

  // Sort projects by order
  const sortedProjects = [...projects].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Handle reorder
  const handleReorder = async (newOrder: Project[]) => {
    setProjects(newOrder);
    
    // Update order in database
    try {
      await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projects: newOrder.map((proj, index) => ({
            id: proj.id,
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
      description: "",
      category: "past",
      imageUrl: "",
      videoUrl: "",
      projectUrl: "",
      githubUrl: "",
      skillIds: [],
      isPublished: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/projects/${editingId}` : "/api/projects";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedProject = await response.json();

        if (editingId) {
          setProjects(
            projects.map((proj) =>
              proj.id === editingId ? savedProject : proj
            )
          );
        } else {
          setProjects([...projects, savedProject]);
        }

        setIsDialogOpen(false);
        resetForm();
        toast({
          title: "Success",
          description: editingId ? "Project updated" : "Project added",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });

      if (response.ok) {
        setProjects(projects.filter((proj) => proj.id !== id));
        toast({ title: "Success", description: "Project deleted" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleTogglePublished = async (id: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished }),
      });

      if (response.ok) {
        setProjects(
          projects.map((proj) =>
            proj.id === id ? { ...proj, isPublished } : proj
          )
        );
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const openEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      imageUrl: project.imageUrl || "",
      videoUrl: project.videoUrl || "",
      projectUrl: project.projectUrl || "",
      githubUrl: project.githubUrl || "",
      skillIds: project.skills?.map((s) => s.id) || [],
      isPublished: project.isPublished,
    });
    setEditingId(project.id);
    setIsDialogOpen(true);
  };

  const toggleSkill = (skillId: string) => {
    setFormData((prev) => ({
      ...prev,
      skillIds: prev.skillIds.includes(skillId)
        ? prev.skillIds.filter((id) => id !== skillId)
        : [...prev.skillIds, skillId],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Projects</h2>
          <p className="text-muted-foreground">Manage your portfolio projects (drag to reorder)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Project" : "Add Project"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
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
                    <SelectItem value="past">Past Project</SelectItem>
                    <SelectItem value="in-development">In Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Project Thumbnail Upload */}
              <div>
                <Label>Project Thumbnail</Label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  label="Upload Thumbnail"
                  accept="image"
                  maxSize={5}
                  className="mt-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Live Demo URL</Label>
                  <Input
                    value={formData.projectUrl}
                    onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>GitHub URL</Label>
                  <Input
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              {/* Skills Selection */}
              <div>
                <Label>Related Skills</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant={formData.skillIds.includes(skill.id) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        formData.skillIds.includes(skill.id) &&
                          "bg-primary text-primary-foreground"
                      )}
                      onClick={() => toggleSkill(skill.id)}
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
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

      {/* Projects List with Drag & Drop */}
      <Reorder.Group
        axis="y"
        values={sortedProjects}
        onReorder={handleReorder}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {sortedProjects.map((project) => (
          <Reorder.Item
            key={project.id}
            value={project}
            className={cn(
              "p-4 rounded-lg border border-border bg-card",
              "hover:border-primary/30 transition-colors cursor-grab active:cursor-grabbing"
            )}
          >
            <div className="flex items-start gap-3">
              <GripVertical className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />

              {/* Project Thumbnail */}
              {project.imageUrl && project.imageUrl.trim() !== "" && (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{project.title}</h3>
                  <Badge
                    variant={project.category === "in-development" ? "default" : "secondary"}
                    className={cn(
                      "text-xs flex-shrink-0",
                      project.category === "in-development" && "bg-amber-500/20 text-amber-500"
                    )}
                  >
                    {project.category === "in-development" ? "🚧 In Dev" : "✓ Past"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {project.skills?.slice(0, 3).map((skill) => (
                    <Badge key={skill.id} variant="outline" className="text-xs">
                      {skill.name}
                    </Badge>
                  ))}
                  {project.skills?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.skills.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm inline-flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground text-sm inline-flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaGithub className="w-4 h-4 mr-1" />
                      Code
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Switch
                  checked={project.isPublished}
                  onCheckedChange={(checked) => handleTogglePublished(project.id, checked)}
                />
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(project);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {projects.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No projects yet. Add your first project to get started.</p>
        </div>
      )}
    </div>
  );
}