"use client";

import { useState, useCallback } from "react";
import { X, Image as ImageIcon, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  accept?: "image" | "document";
  maxSize?: number; // in MB
  className?: string;
  previewClassName?: string;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  accept = "image",
  maxSize = 10,
  className,
  previewClassName,
  label = "Upload Image",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize value - treat empty string as null
  const displayValue = value && value.trim() !== "" ? value : null;

  const acceptedTypes = accept === "document"
    ? "image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf"
    : "image/jpeg,image/png,image/gif,image/webp,image/svg+xml";

  const handleUpload = useCallback(async (file: File) => {
    setError(null);
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", accept);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, [accept, maxSize, onChange]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = useCallback(() => {
    onChange("");
  }, [onChange]);

  const isImage = displayValue && !displayValue.endsWith(".pdf");
  const isPdf = displayValue && displayValue.endsWith(".pdf");

  return (
    <div className={cn("space-y-2", className)}>
      {displayValue ? (
        <div className={cn("relative group", previewClassName)}>
          {isImage ? (
            <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border bg-surface-200">
              <img
                src={displayValue}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleRemove}
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ) : isPdf ? (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-surface-200">
              <FileText className="w-8 h-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {displayValue.split("/").pop()}
                </p>
                <p className="text-xs text-muted-foreground">PDF Document</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-40 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-surface-200",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById(`file-input-${label}`)?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max {maxSize}MB
                </p>
              </div>
            </div>
          )}
          <input
            id={`file-input-${label}`}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      )}
      
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}