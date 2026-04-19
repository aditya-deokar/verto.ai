"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Sparkles,
  X,
  Tag,
  Plus,
  Globe,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { saveProjectAsTemplate } from "@/actions/templates";
import type { TemplateCategory, TemplateDifficulty } from "@/generated/prisma";

const CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: "BUSINESS", label: "Business & Corporate" },
  { value: "STARTUP_PITCH", label: "Startup & Pitch" },
  { value: "EDUCATION", label: "Education & Academic" },
  { value: "MARKETING", label: "Marketing & Sales" },
  { value: "CREATIVE", label: "Creative & Portfolio" },
  { value: "TECHNOLOGY", label: "Technology & Engineering" },
  { value: "PROJECT_MANAGEMENT", label: "Project Management" },
  { value: "PERSONAL_EVENTS", label: "Personal & Events" },
  { value: "DATA_RESEARCH", label: "Data & Research" },
  { value: "TRAINING", label: "Training & Onboarding" },
  { value: "MINIMAL", label: "Minimal & Clean" },
];

const DIFFICULTIES: {
  value: TemplateDifficulty;
  label: string;
  color: string;
}[] = [
  { value: "BEGINNER", label: "Beginner", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "INTERMEDIATE", label: "Intermediate", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "ADVANCED", label: "Advanced", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
];

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  slideCount: number;
}

export default function SaveAsTemplateModal({
  isOpen,
  onClose,
  projectId,
  slideCount,
}: SaveAsTemplateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TemplateCategory | null>(null);;
  const [difficulty, setDifficulty] = useState<TemplateDifficulty>("BEGINNER");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canSave =
    name.trim().length >= 3 &&
    description.trim().length >= 10 &&
    category !== null &&
    tags.length >= 2;

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && tags.length < 8 && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!canSave || !category) return;

    setIsSaving(true);

    try {
      const result = await saveProjectAsTemplate(projectId, {
        name: name.trim(),
        description: description.trim(),
        category: category as TemplateCategory,
        tags,
        difficulty,
        isPublic,
      });

      if (result.status === 200 && "data" in result) {
        toast.success("Template saved!", {
          description: isPublic
            ? "Your template is now available in the community gallery."
            : "Template saved to your private collection.",
        });
        onClose();
        resetForm();
      } else {
        toast.error("error" in result ? result.error : "Failed to save template");
      }
    } catch {
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory(null);
    setDifficulty("BEGINNER");
    setTags([]);
    setTagInput("");
    setIsPublic(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-background/95 backdrop-blur-xl border-border/50 p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-lg">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20">
                <Layers className="h-4 w-4 text-violet-400" />
              </div>
              Save as Template
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mt-2">
            Turn this {slideCount}-slide presentation into a reusable
            template that you or others can use.
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Warning for small decks */}
          {slideCount < 3 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
              <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-amber-300">
                Templates work best with 3+ slides. Your presentation
                has only {slideCount}.
              </p>
            </div>
          )}

          {/* Name*/}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Template Name *
            </label>
            <Input
              placeholder="e.g., Startup Pitch Deck"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 80))}
              className="bg-background/60"
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {name.length}/80
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Description *
            </label>
            <Textarea
              placeholder="Describe what this template is best used for..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              className="bg-background/60 min-h-[70px]"
            />
            <p className="text-[10px] text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>

          {/* Category + Difficulty row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={category ?? undefined}
                onValueChange={(v) => setCategory(v as TemplateCategory)}
              >
                <SelectTrigger className="bg-background/60">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Difficulty *</label>
              <div className="flex items-center gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-lg transition-all border ${
                      difficulty === d.value
                        ? d.color
                        : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Tags * <span className="text-muted-foreground font-normal">(min 2, max 8)</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="pl-9 bg-background/60"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 8}
                className="rounded-lg"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[11px] px-2 py-0.5 gap-1 cursor-pointer hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="h-2.5 w-2.5" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsPublic(false)}
                className={`flex items-center gap-2 p-3 rounded-lg text-sm border transition-all ${
                  !isPublic
                    ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                    : "bg-muted/20 border-transparent text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Lock className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-medium text-xs">Private</p>
                  <p className="text-[10px] opacity-70">Only you</p>
                </div>
              </button>
              <button
                onClick={() => setIsPublic(true)}
                className={`flex items-center gap-2 p-3 rounded-lg text-sm border transition-all ${
                  isPublic
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-muted/20 border-transparent text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Globe className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-medium text-xs">Community</p>
                  <p className="text-[10px] opacity-70">Everyone</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {slideCount} slides will be saved
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className="rounded-lg gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0"
            >
              {isSaving ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" /> Save Template
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
