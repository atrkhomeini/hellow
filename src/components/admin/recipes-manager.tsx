"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, Clock, Thermometer, Scale, Droplets, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { BREW_METHODS, getGrindSizeLabel, formatTime } from "@/lib/utils/brewMath";

interface Bean {
  id: string;
  name: string;
  roaster: string | null;
}

interface Recipe {
  id: string;
  method: string;
  doseGram: number;
  yieldGram: number;
  temperatureC: number;
  grindSize: string;
  totalTimeSec: number;
  instructions: string | null;
  isActive: boolean;
  beans: { bean: Bean }[];
}

const GRIND_SIZES = [
  { value: "extra_fine", label: "Extra Fine" },
  { value: "fine", label: "Fine" },
  { value: "medium_fine", label: "Medium Fine" },
  { value: "medium", label: "Medium" },
  { value: "medium_coarse", label: "Medium Coarse" },
  { value: "coarse", label: "Coarse" },
  { value: "extra_coarse", label: "Extra Coarse" },
];

export function RecipesManager() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [beans, setBeans] = useState<Bean[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    method: "",
    doseGram: "",
    yieldGram: "",
    temperatureC: "",
    grindSize: "",
    totalTimeSec: "",
    instructions: [] as { step: number; action: string; duration?: number }[],
    selectedBeanIds: [] as string[],
    isActive: true,
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [recipesRes, beansRes] = await Promise.all([
        fetch("/api/recipes"),
        fetch("/api/beans"),
      ]);

      if (recipesRes.ok) setRecipes(await recipesRes.json());
      if (beansRes.ok) setBeans(await beansRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset form
  const resetForm = () => {
    setFormData({
      method: "",
      doseGram: "",
      yieldGram: "",
      temperatureC: "",
      grindSize: "",
      totalTimeSec: "",
      instructions: [],
      selectedBeanIds: [],
      isActive: true,
    });
    setEditingId(null);
  };

  // Handle instruction steps
  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [
        ...formData.instructions,
        { step: formData.instructions.length + 1, action: "", duration: undefined },
      ],
    });
  };

  const updateInstruction = (index: number, field: string, value: string | number) => {
    const updated = [...formData.instructions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, instructions: updated });
  };

  const removeInstruction = (index: number) => {
    const updated = formData.instructions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      instructions: updated.map((inst, i) => ({ ...inst, step: i + 1 })),
    });
  };

  // Toggle bean selection
  const toggleBean = (beanId: string) => {
    setFormData({
      ...formData,
      selectedBeanIds: formData.selectedBeanIds.includes(beanId)
        ? formData.selectedBeanIds.filter((id) => id !== beanId)
        : [...formData.selectedBeanIds, beanId],
    });
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      method: formData.method,
      doseGram: parseFloat(formData.doseGram),
      yieldGram: parseFloat(formData.yieldGram),
      temperatureC: parseInt(formData.temperatureC),
      grindSize: formData.grindSize,
      totalTimeSec: parseInt(formData.totalTimeSec),
      instructions: formData.instructions.length > 0 ? formData.instructions : null,
      beanIds: formData.selectedBeanIds,
      isActive: formData.isActive,
    };

    try {
      const url = editingId ? `/api/recipes/${editingId}` : "/api/recipes";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingId ? "Recipe updated" : "Recipe added",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this recipe?")) return;

    try {
      await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      setRecipes(recipes.filter((r) => r.id !== id));
      toast({ title: "Deleted" });
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  // Open edit
  const openEdit = (recipe: Recipe) => {
    setFormData({
      method: recipe.method,
      doseGram: recipe.doseGram.toString(),
      yieldGram: recipe.yieldGram.toString(),
      temperatureC: recipe.temperatureC.toString(),
      grindSize: recipe.grindSize,
      totalTimeSec: recipe.totalTimeSec.toString(),
      instructions: recipe.instructions ? JSON.parse(recipe.instructions) : [],
      selectedBeanIds: recipe.beans.map((b) => b.bean.id),
      isActive: recipe.isActive,
    });
    setEditingId(recipe.id);
    setIsDialogOpen(true);
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Brew Recipes</h2>
          <p className="text-muted-foreground text-sm">
            Manage recipes and link them to beans
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Recipe
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Recipe" : "Add Recipe"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Method */}
              <div>
                <Label>Brewing Method *</Label>
                <Select
                  value={formData.method}
                  onValueChange={(v) => setFormData({ ...formData, method: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {BREW_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recipe Parameters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Dose (g) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.doseGram}
                    onChange={(e) => setFormData({ ...formData, doseGram: e.target.value })}
                    placeholder="18"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Yield (g) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.yieldGram}
                    onChange={(e) => setFormData({ ...formData, yieldGram: e.target.value })}
                    placeholder="250"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Temp (°C) *</Label>
                  <Input
                    type="number"
                    value={formData.temperatureC}
                    onChange={(e) => setFormData({ ...formData, temperatureC: e.target.value })}
                    placeholder="93"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Time (sec) *</Label>
                  <Input
                    type="number"
                    value={formData.totalTimeSec}
                    onChange={(e) => setFormData({ ...formData, totalTimeSec: e.target.value })}
                    placeholder="150"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Grind Size */}
              <div>
                <Label>Grind Size *</Label>
                <Select
                  value={formData.grindSize}
                  onValueChange={(v) => setFormData({ ...formData, grindSize: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select grind size" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRIND_SIZES.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brewing Instructions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Brewing Steps</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add Step
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.instructions.map((inst, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="w-6 h-9 flex items-center justify-center text-sm font-medium text-muted-foreground">
                        {i + 1}.
                      </span>
                      <Input
                        value={inst.action}
                        onChange={(e) => updateInstruction(i, "action", e.target.value)}
                        placeholder="Describe the step..."
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={inst.duration || ""}
                        onChange={(e) => updateInstruction(i, "duration", parseInt(e.target.value))}
                        placeholder="Sec"
                        className="w-20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInstruction(i)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Plus className="w-4 h-4 rotate-45" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked Beans */}
              <div>
                <Label>Link to Beans</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select which beans this recipe works for
                </p>
                <div className="flex flex-wrap gap-2">
                  {beans.map((bean) => (
                    <Badge
                      key={bean.id}
                      variant={formData.selectedBeanIds.includes(bean.id) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        formData.selectedBeanIds.includes(bean.id) && "bg-primary text-primary-foreground"
                      )}
                      onClick={() => toggleBean(bean.id)}
                    >
                      {bean.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label>Active</Label>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-4 border-t">
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

      {/* Recipes List */}
      {recipes.length > 0 ? (
        <div className="grid gap-4">
          {recipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-border bg-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-3 capitalize">
                    {BREW_METHODS.find((m) => m.value === recipe.method)?.label || recipe.method}
                  </h3>

                  <div className="grid grid-cols-4 gap-4 text-center mb-3">
                    <div>
                      <Scale className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="font-bold">{recipe.doseGram}g</p>
                      <p className="text-xs text-muted-foreground">Dose</p>
                    </div>
                    <div>
                      <Droplets className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="font-bold">{recipe.yieldGram}g</p>
                      <p className="text-xs text-muted-foreground">Yield</p>
                    </div>
                    <div>
                      <Thermometer className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="font-bold">{recipe.temperatureC}°C</p>
                      <p className="text-xs text-muted-foreground">Temp</p>
                    </div>
                    <div>
                      <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="font-bold">{formatTime(recipe.totalTimeSec)}</p>
                      <p className="text-xs text-muted-foreground">Time</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline">{getGrindSizeLabel(recipe.grindSize)}</Badge>
                    {recipe.beans.map((b) => (
                      <Badge key={b.bean.id} variant="secondary">
                        <Coffee className="w-3 h-3 mr-1" />
                        {b.bean.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(recipe)}>
                    Edit
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(recipe.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
          <p>No recipes yet. Add your first brewing recipe.</p>
        </div>
      )}
    </div>
  );
}