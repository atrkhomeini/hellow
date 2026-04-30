"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Music, Coffee, Dumbbell, ExternalLink } from "lucide-react";
import { usePortfolioStore, TasteItem } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  { value: "music", label: "Music", icon: Music },
  { value: "brewing", label: "Brewing", icon: Coffee },
  { value: "fitness", label: "Fitness", icon: Dumbbell },
];

export function TasteManager() {
  const { tasteItems, setTasteItems } = usePortfolioStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "music",
    content: "",
    embedUrl: "",
    imageUrl: "",
    isPublished: true,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      category: "music",
      content: "",
      embedUrl: "",
      imageUrl: "",
      isPublished: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/taste-items/${editingId}` : "/api/taste-items";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const savedItem = await response.json();

        if (editingId) {
          setTasteItems(
            tasteItems.map((item) =>
              item.id === editingId ? savedItem : item
            )
          );
        } else {
          setTasteItems([...tasteItems, savedItem]);
        }

        setIsDialogOpen(false);
        resetForm();
        toast({
          title: "Success",
          description: editingId ? "Item updated" : "Item added",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/taste-items?id=${id}`, { method: "DELETE" });

      if (response.ok) {
        setTasteItems(tasteItems.filter((item) => item.id !== id));
        toast({ title: "Success", description: "Item deleted" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const openEdit = (item: TasteItem) => {
    setFormData({
      title: item.title,
      category: item.category,
      content: item.content || "",
      embedUrl: item.embedUrl || "",
      imageUrl: item.imageUrl || "",
      isPublished: item.isPublished,
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.icon || Music;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">My Taste</h2>
          <p className="text-muted-foreground">Manage your personal interests</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Item" : "Add Item"}</DialogTitle>
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
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Apple Music Embed URL (optional)</Label>
                <Input
                  value={formData.embedUrl}
                  onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                  placeholder="https://embed.music.apple.com/..."
                />
              </div>
              <div>
                <Label>Cover Image</Label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  label="Upload Cover Image"
                  accept="image"
                  maxSize={5}
                  className="mt-2"
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

      {/* Items by Category */}
      {categories.map((category) => {
        const categoryItems = tasteItems.filter((item) => item.category === category.value);
        const Icon = category.icon;

        return (
          <div key={category.value} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Icon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">{category.label}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      {item.imageUrl && item.imageUrl.trim() !== "" && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.content}
                        </p>
                        {item.embedUrl && (
                          <a
                            href={item.embedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Embed
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Switch
                        checked={item.isPublished}
                        onCheckedChange={async (checked) => {
                          const response = await fetch(`/api/taste-items`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: item.id, isPublished: checked }),
                          });
                          if (response.ok) {
                            setTasteItems(
                              tasteItems.map((i) =>
                                i.id === item.id ? { ...i, isPublished: checked } : i
                              )
                            );
                          }
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {categoryItems.length === 0 && (
              <p className="text-muted-foreground text-sm">No items in this category.</p>
            )}
          </div>
        );
      })}

      {tasteItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No taste items yet. Add your first item to get started.</p>
        </div>
      )}
    </div>
  );
}