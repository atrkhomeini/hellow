"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, Reorder } from "framer-motion";
import { Plus, Trash2, GripVertical, Coffee, Edit, X } from "lucide-react";
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

interface Bean {
  id: string;
  name: string;
  roaster: string | null;
  origin: string | null;
  region: string | null;
  altitude: number | null;
  process: string | null;
  variety: string | null;
  tasteNotes: string | null;
  isActive: boolean;
  createdAt: string;
}

const PROCESSES = [
  { value: "natural", label: "Natural" },
  { value: "washed", label: "Washed" },
  { value: "honey", label: "Honey" },
  { value: "anaerobic", label: "Anaerobic" },
  { value: "wet-hulled", label: "Wet-Hulled" },
];

export function BeansManager() {
  const [beans, setBeans] = useState<Bean[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    roaster: "",
    origin: "",
    region: "",
    altitude: "",
    process: "",
    variety: "",
    tasteNotes: "",
    isActive: true,
  });

  // Fetch beans
  const fetchBeans = useCallback(async () => {
    try {
      const response = await fetch("/api/beans");
      if (response.ok) {
        const data = await response.json();
        setBeans(data);
      }
    } catch (error) {
      console.error("Failed to fetch beans:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBeans();
  }, [fetchBeans]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      roaster: "",
      origin: "",
      region: "",
      altitude: "",
      process: "",
      variety: "",
      tasteNotes: "",
      isActive: true,
    });
    setEditingId(null);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      roaster: formData.roaster || null,
      origin: formData.origin || null,
      region: formData.region || null,
      altitude: formData.altitude ? parseInt(formData.altitude) : null,
      process: formData.process || null,
      variety: formData.variety || null,
      tasteNotes: formData.tasteNotes
        ? formData.tasteNotes.split(",").map((n) => n.trim())
        : null,
      isActive: formData.isActive,
    };

    try {
      const url = editingId ? `/api/beans/${editingId}` : "/api/beans";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingId ? "Bean updated" : "Bean added",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchBeans();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save bean",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bean?")) return;

    try {
      const response = await fetch(`/api/beans/${id}`, { method: "DELETE" });
      if (response.ok) {
        setBeans(beans.filter((b) => b.id !== id));
        toast({ title: "Deleted", description: "Bean removed" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  // Handle edit
  const openEdit = (bean: Bean) => {
    setFormData({
      name: bean.name,
      roaster: bean.roaster || "",
      origin: bean.origin || "",
      region: bean.region || "",
      altitude: bean.altitude?.toString() || "",
      process: bean.process || "",
      variety: bean.variety || "",
      tasteNotes: bean.tasteNotes ? JSON.parse(bean.tasteNotes).join(", ") : "",
      isActive: bean.isActive,
    });
    setEditingId(bean.id);
    setIsDialogOpen(true);
  };

  // Toggle active
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/beans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setBeans(beans.map((b) => (b.id === id ? { ...b, isActive } : b)));
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Coffee Beans</h2>
          <p className="text-muted-foreground text-sm">
            Manage bean profiles for recommendations
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Bean
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Bean" : "Add Bean"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Ethiopia Yirgacheffe"
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Roaster</Label>
                  <Input
                    value={formData.roaster}
                    onChange={(e) => setFormData({ ...formData, roaster: e.target.value })}
                    placeholder="e.g., Blue Bottle"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Origin</Label>
                  <Input
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="e.g., Ethiopia"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Region</Label>
                  <Input
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="e.g., Yirgacheffe"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Altitude (m)</Label>
                  <Input
                    type="number"
                    value={formData.altitude}
                    onChange={(e) => setFormData({ ...formData, altitude: e.target.value })}
                    placeholder="e.g., 1800"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Process</Label>
                  <Select
                    value={formData.process}
                    onValueChange={(v) => setFormData({ ...formData, process: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select process" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROCESSES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Variety</Label>
                  <Input
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    placeholder="e.g., Typica"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Taste Notes (comma-separated)</Label>
                <Input
                  value={formData.tasteNotes}
                  onChange={(e) => setFormData({ ...formData, tasteNotes: e.target.value })}
                  placeholder="e.g., citrus, floral, berry"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(c) => setFormData({ ...formData, isActive: c })}
                />
                <Label>Active</Label>
              </div>

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

      {/* Beans List */}
      {beans.length > 0 ? (
        <div className="grid gap-4">
          {beans.map((bean) => (
            <motion.div
              key={bean.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="w-4 h-4 text-amber-500" />
                    <h3 className="font-semibold text-foreground">{bean.name}</h3>
                    {bean.roaster && (
                      <span className="text-sm text-muted-foreground">by {bean.roaster}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {bean.origin && <span>🌍 {bean.origin}</span>}
                    {bean.region && <span>📍 {bean.region}</span>}
                    {bean.altitude && <span>⛰️ {bean.altitude}m</span>}
                    {bean.process && <span>⚙️ {bean.process}</span>}
                    {bean.variety && <span>🌱 {bean.variety}</span>}
                  </div>

                  {bean.tasteNotes && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {JSON.parse(bean.tasteNotes).map((note: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded-full bg-surface-200 border border-border"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={bean.isActive}
                    onCheckedChange={(c) => handleToggleActive(bean.id, c)}
                  />
                  <Button size="sm" variant="outline" onClick={() => openEdit(bean)}>
                    Edit
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(bean.id)}
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
          <Coffee className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No beans yet. Add your first coffee bean to get started.</p>
        </div>
      )}
    </div>
  );
}