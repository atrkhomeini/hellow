"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface JsonEditorProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  className?: string;
  readOnly?: boolean;
}

export function JsonEditor({ value, onChange, className, readOnly = false }: JsonEditorProps) {
  const [jsonText, setJsonText] = React.useState(JSON.stringify(value, null, 2));
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setJsonText(JSON.stringify(value, null, 2));
  }, [value]);

  const handleChange = (text: string) => {
    setJsonText(text);
    
    try {
      const parsed = JSON.parse(text);
      setError(null);
      onChange(parsed);
    } catch (e) {
      setError("Invalid JSON format");
    }
  };

  return (
    <div className={cn("relative", className)}>
      <textarea
        value={jsonText}
        onChange={(e) => handleChange(e.target.value)}
        readOnly={readOnly}
        className={cn(
          "w-full h-48 p-4 rounded-lg font-mono text-sm",
          "bg-surface-200 border border-border",
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          "resize-none",
          error && "border-destructive"
        )}
        spellCheck={false}
      />
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

// Structured field editor for key-value pairs
interface StructuredFieldEditorProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  fields: { key: string; label: string; type?: "text" | "textarea" }[];
  className?: string;
}

export function StructuredFieldEditor({
  value,
  onChange,
  fields,
  className,
}: StructuredFieldEditorProps) {
  const handleChange = (key: string, fieldValue: string) => {
    onChange({ ...value, [key]: fieldValue });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-foreground mb-1">
            {field.label}
          </label>
          {field.type === "textarea" ? (
            <textarea
              value={value[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className={cn(
                "w-full p-3 rounded-lg text-sm",
                "bg-surface-200 border border-border",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "resize-none"
              )}
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={value[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className={cn(
                "w-full p-3 rounded-lg text-sm",
                "bg-surface-200 border border-border",
                "focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}