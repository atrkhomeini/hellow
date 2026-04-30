"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, User } from "lucide-react";
import { usePortfolioStore, Profile } from "@/store/portfolio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "@/hooks/use-toast";

export function ProfileManager() {
  const { profile, setProfile } = usePortfolioStore();
  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    bio: "",
    photoUrl: "",
    cvUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        headline: profile.headline || "",
        bio: profile.bio || "",
        photoUrl: profile.photoUrl || "",
        cvUrl: profile.cvUrl || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your public profile information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Preview & Upload */}
        <div className="flex items-start gap-6">
          <Avatar className="w-24 h-24 border-2 border-border flex-shrink-0">
            {formData.photoUrl && <AvatarImage src={formData.photoUrl} alt={formData.name} />}
            <AvatarFallback className="text-2xl bg-primary/10">
              {formData.name?.charAt(0) || <User className="w-8 h-8" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label>Profile Photo</Label>
            <ImageUpload
              value={formData.photoUrl}
              onChange={(url) => setFormData({ ...formData, photoUrl: url })}
              label="Upload Photo"
              accept="image"
              maxSize={5}
              className="mt-2"
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your Name"
            required
          />
        </div>

        {/* Headline */}
        <div>
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            placeholder="Full Stack Developer"
          />
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>

        {/* CV Upload */}
        <div>
          <Label>CV / Resume</Label>
          <ImageUpload
            value={formData.cvUrl}
            onChange={(url) => setFormData({ ...formData, cvUrl: url })}
            label="Upload CV (PDF)"
            accept="document"
            maxSize={10}
            className="mt-2"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Save className="w-5 h-5" />
            </motion.div>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </form>
    </div>
  );
}