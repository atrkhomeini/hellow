"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Music, Coffee, Dumbbell, Save } from "lucide-react";
import { usePortfolioStore, TasteItem } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { StructuredFieldEditor } from "@/components/ui/json-editor";
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

// Field definitions for structured data
const brewingFields = [
  { key: "gear", label: "Gear", type: "text" as const },
  { key: "favoriteBeans", label: "Favorite Beans Recently", type: "text" as const },
  { key: "regional", label: "Regional", type: "text" as const },
  { key: "purchaseLink", label: "Link Pembelian Beans (URL)", type: "text" as const },
];

const fitnessFields = [
  { key: "exercise", label: "Exercise Name", type: "text" as const },
  { key: "personalRecord", label: "Personal Record (e.g., 110KG)", type: "text" as const },
  { key: "quote", label: "Quote", type: "textarea" as const },
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
    structuredData: {} as Record<string, string>,
    isPublished: true,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      category: "music",
      content: "",
      embedUrl: "",
      imageUrl: "",
      structuredData: {},
      isPublished: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/taste-items/${editingId}` : "/api/taste-items";
      const method = editingId ? "PUT" : "POST";

      // Store structured data in content field as JSON
      const contentPayload = formData.category !== "music" 
        ? JSON.stringify(formData.structuredData)
        : formData.content;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          content: contentPayload,
          embedUrl: formData.embedUrl,
          imageUrl: formData.imageUrl,
          isPublished: formData.isPublished,
        }),
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
    // Parse structured data from content
    let structuredData = {};
    let content = item.content || "";
    
    if (item.category !== "music" && item.content) {
      try {
        structuredData = JSON.parse(item.content);
        content = "";
      } catch {
        // If not valid JSON, keep as content
      }
    }

    setFormData({
      title: item.title,
      category: item.category,
      content,
      embedUrl: item.embedUrl || "",
      imageUrl: item.imageUrl || "",
      structuredData,
      isPublished: item.isPublished,
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const getFieldsForCategory = (category: string) => {
    switch (category) {
      case "brewing":
        return brewingFields;
      case "fitness":
        return fitnessFields;
      default:
        return [];
    }
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Item" : "Add Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={formData.category === "music" ? "Song Title" : formData.category === "brewing" ? "Coffee Name" : "Workout Name"}
                    required
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      category: value,
                      structuredData: {}
                    })}
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
              </div>

              {/* Music-specific fields */}
              {formData.category === "music" && (
                <>
                  <div>
                    <Label>Apple Music Embed URL</Label>
                    <Input
                      value={formData.embedUrl}
                      onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
                      placeholder="https://embed.music.apple.com/..."
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Brief description..."
                    />
                  </div>
                </>
              )}

              {/* Brewing & Fitness structured fields */}
              {formData.category !== "music" && (
                <div className="border border-border rounded-lg p-4 bg-surface-200/50">
                  <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    {formData.category === "brewing" ? (
                      <Coffee className="w-4 h-4 text-primary" />
                    ) : (
                      <Dumbbell className="w-4 h-4 text-primary" />
                    )}
                    {formData.category === "brewing" ? "Coffee Details" : "Fitness Details"}
                  </h4>
                  <StructuredFieldEditor
                    value={formData.structuredData}
                    onChange={(value) => setFormData({ ...formData, structuredData: value })}
                    fields={getFieldsForCategory(formData.category)}
                  />
                </div>
              )}

              {/* Image Upload */}
              {formData.category !== "music" && (
                <div>
                  <Label>Cover Image</Label>
                  <ImageUpload
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    label="Upload Image"
                    accept="image"
                    maxSize={5}
                    className="mt-2"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPublished: checked })
                  }
                />
                <Label>Published</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
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
              <span className="text-sm text-muted-foreground">({categoryItems.length})</span>
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
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-foreground">{item.title}</h4>
                        {item.category === "music" ? (
                          <p className="text-sm text-muted-foreground">{item.content}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {Object.keys(item.content ? (() => { try { return JSON.parse(item.content); } catch { return {}; } })() : {}).length} fields configured
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
    </div>
  );
}