"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  Crown,
  Sparkles,
  Layers,
  Heart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  Bot,
  Eye,
  X,
  Briefcase,
  Rocket,
  BookOpen,
  BarChart3,
  Palette,
  Cpu,
  ClipboardList,
  PartyPopper,
  TrendingUp,
  GraduationCap,
  Minimize2,
  User,
  Globe,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  type TemplateListItem,
  type TemplateFilters,
  getTemplates,
  getTemplateById,
  cloneTemplateToProject,
  toggleTemplateFavorite,
  getUserFavoriteIds,
  seedTemplates,
  getUserTemplates,
  deleteUserTemplate,
  checkPremiumAccess,
  rateTemplate,
} from "@/actions/templates";
import type { TemplateCategory, TemplateDifficulty } from "@/generated/prisma";
import type { Slide } from "@/lib/types";
import { generateFromTemplateAction } from "@/actions/generateFromTemplate";
import { createPresentationGenerationRun } from "@/actions/presentation-generation";
import PremiumUpsellDialog from "@/components/global/PremiumUpsellDialog";
import { useLayoutStore } from "@/store/useLayoutStore";
import { LayoutSwitcher } from "@/components/global/layouts/LayoutSwitcher";
import { cn } from "@/lib/utils";

// ─── Constants ───

const CATEGORIES: {
  key: TemplateCategory | "ALL";
  label: string;
  icon: React.ElementType;
}[] = [
    { key: "ALL", label: "All", icon: Layers },
    { key: "BUSINESS", label: "Business", icon: Briefcase },
    { key: "STARTUP_PITCH", label: "Startup", icon: Rocket },
    { key: "EDUCATION", label: "Education", icon: BookOpen },
    { key: "MARKETING", label: "Marketing", icon: BarChart3 },
    { key: "CREATIVE", label: "Creative", icon: Palette },
    { key: "TECHNOLOGY", label: "Technology", icon: Cpu },
    { key: "PROJECT_MANAGEMENT", label: "Projects", icon: ClipboardList },
    { key: "PERSONAL_EVENTS", label: "Events", icon: PartyPopper },
    { key: "DATA_RESEARCH", label: "Data", icon: TrendingUp },
    { key: "TRAINING", label: "Training", icon: GraduationCap },
    { key: "MINIMAL", label: "Minimal", icon: Minimize2 },
  ];

type GalleryTab = "browse" | "my-templates" | "community";

const DIFFICULTY_COLORS: Record<TemplateDifficulty, string> = {
  BEGINNER: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  INTERMEDIATE: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  ADVANCED: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

// ═══════════════════════════════════════════════════════════
// MAIN GALLERY COMPONENT
// ═══════════════════════════════════════════════════════════

export default function TemplateGallery() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { layout } = useLayoutStore();

  // State
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    TemplateCategory | "ALL"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "rating">(
    "popular"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [hasSeeded, setHasSeeded] = useState(false);

  // Gallery tab state
  const [galleryTab, setGalleryTab] = useState<GalleryTab>("browse");
  const [myTemplates, setMyTemplates] = useState<TemplateListItem[]>([]);
  const [isMyTemplatesLoading, setIsMyTemplatesLoading] = useState(false);

  // Premium state
  const [isPremiumDialogOpen, setIsPremiumDialogOpen] = useState(false);
  const [premiumFeatureText, setPremiumFeatureText] = useState("");

  // Rating state
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingTemplateId, setRatingTemplateId] = useState("");
  const [pendingRating, setPendingRating] = useState(0);

  // Preview state
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // AI populate state
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiContext, setAiContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplateForAI, setSelectedTemplateForAI] =
    useState<TemplateListItem | null>(null);

  // ─── Data Fetching ───

  const fetchTemplates = React.useCallback(
    async (pageNum = 0, append = false) => {
      setIsLoading(true);
      const filters: TemplateFilters = {
        page: pageNum,
        limit: 20,
        sortBy,
      };
      if (selectedCategory !== "ALL") filters.category = selectedCategory;
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      const result = await getTemplates(filters);

      if (result.status === 200 && result.data) {
        if (append) {
          setTemplates((prev) => [...prev, ...result.data!.templates]);
        } else {
          setTemplates(result.data.templates);
        }
        setHasMore(result.data.hasMore);
      }

      setIsLoading(false);
    },
    [selectedCategory, searchQuery, sortBy]
  );

  React.useEffect(() => {
    setPage(0);
    fetchTemplates(0);
  }, [fetchTemplates]);

  React.useEffect(() => {
    getUserFavoriteIds().then((r) => {
      if (r.status === 200 && r.data) {
        setFavoriteIds(new Set(r.data));
      }
    });
  }, []);

  // Auto-seed on first load if empty
  React.useEffect(() => {
    if (!isLoading && templates.length === 0 && !hasSeeded) {
      setHasSeeded(true);
      seedTemplates().then((r) => {
        if (r.status === 200 && r.data && r.data.seeded > 0) {
          fetchTemplates(0);
        }
      });
    }
  }, [isLoading, templates.length, hasSeeded, fetchTemplates]);

  // ─── My Templates fetching ───

  const fetchMyTemplates = React.useCallback(async () => {
    setIsMyTemplatesLoading(true);
    const result = await getUserTemplates();
    if (result.status === 200 && result.data) {
      setMyTemplates(result.data as TemplateListItem[]);
    }
    setIsMyTemplatesLoading(false);
  }, []);

  React.useEffect(() => {
    if (galleryTab === "my-templates") {
      fetchMyTemplates();
    }
  }, [galleryTab, fetchMyTemplates]);

  // ─── Handlers ───

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTemplates(nextPage, true);
  };

  const handleCategoryChange = (cat: TemplateCategory | "ALL") => {
    setSelectedCategory(cat);
    setPage(0);
  };

  const handlePreview = async (template: TemplateListItem) => {
    const result = await getTemplateById(template.id);
    if (result.status === 200 && result.data) {
      setPreviewTemplate(result.data);
      setPreviewSlideIndex(0);
      setIsPreviewOpen(true);
    } else {
      toast.error("Failed to load template preview");
    }
  };

  const handlePremiumGatedAction = async (
    templateId: string,
    action: () => void,
    featureLabel: string
  ) => {
    const access = await checkPremiumAccess(templateId);
    if (access.hasAccess) {
      action();
    } else {
      setPremiumFeatureText(featureLabel);
      setIsPremiumDialogOpen(true);
    }
  };

  const handleUseTemplate = async (templateId: string, isPremium = false) => {
    if (isPremium) {
      return handlePremiumGatedAction(templateId, () => {
        startTransition(async () => {
          const result = await cloneTemplateToProject(templateId);
          if (result.status === 200 && result.data) {
            toast.success("Template cloned! Redirecting to editor...");
            router.push(`/presentation/${result.data.projectId}`);
          } else {
            toast.error("error" in result ? result.error : "Failed to clone template");
          }
        });
      }, "This premium template");
    }

    startTransition(async () => {
      const result = await cloneTemplateToProject(templateId);
      if (result.status === 200 && result.data) {
        toast.success("Template cloned! Redirecting to editor...");
        router.push(`/presentation/${result.data.projectId}`);
      } else {
        toast.error("error" in result ? result.error : "Failed to clone template");
      }
    });
  };

  const handleToggleFavorite = async (templateId: string) => {
    const result = await toggleTemplateFavorite(templateId);
    if (result.status === 200 && result.data) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (result.data!.isFavorited) {
          next.add(templateId);
        } else {
          next.delete(templateId);
        }
        return next;
      });
    }
  };

  const handleDeleteUserTemplate = async (templateId: string) => {
    const result = await deleteUserTemplate(templateId);
    if (result.status === 200) {
      toast.success("Template deleted");
      setMyTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } else {
      toast.error("error" in result ? result.error : "Failed to delete");
    }
  };

  const handleRateTemplate = async () => {
    if (!ratingTemplateId || pendingRating < 1) return;
    const result = await rateTemplate(ratingTemplateId, pendingRating);
    if (result.status === 200 && result.data) {
      toast.success(`Rated ${pendingRating} stars! Average: ${result.data.average}`);
      setIsRatingOpen(false);
      // Refresh templates to show updated rating
      fetchTemplates(0);
    } else {
      toast.error("Failed to rate template");
    }
  };

  const openRatingDialog = (templateId: string) => {
    setRatingTemplateId(templateId);
    setPendingRating(0);
    setIsRatingOpen(true);
  };

  const handleAIPopulate = async () => {
    if (!selectedTemplateForAI || !aiTopic.trim()) return;

    setIsGenerating(true);

    try {
      // Create generation run for progress tracking
      const runResponse = await createPresentationGenerationRun(aiTopic.trim());
      if (runResponse.status !== 200 || !runResponse.data) {
        throw new Error("Failed to create generation run");
      }

      // Generate AI content using the template-aware action
      const result = await generateFromTemplateAction(
        selectedTemplateForAI.id,
        aiTopic.trim(),
        aiContext.trim() || undefined,
        undefined, // use template's theme
        runResponse.data.id
      );

      if (result.success && "projectId" in result && result.projectId) {
        toast.success("AI-powered presentation generated!");
        setIsAIDialogOpen(false);
        setIsPreviewOpen(false);
        router.push(`/presentation/${result.projectId}`);
      } else {
        // Fall back: clone template as-is
        const fallback = await cloneTemplateToProject(
          selectedTemplateForAI.id,
          { title: aiTopic.trim() }
        );
        if (fallback.status === 200 && fallback.data) {
          toast.info("AI generation had issues. Opening your template instead.");
          router.push(`/presentation/${fallback.data.projectId}`);
        } else {
          throw new Error("error" in result ? result.error ?? "Generation failed" : "Generation failed");
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Generation failed"
      );
    } finally {
      setIsGenerating(false);
      setIsAIDialogOpen(false);
    }
  };

  const handleOpenAIDialog = (template: TemplateListItem) => {
    if (template.isPremium) {
      return handlePremiumGatedAction(template.id, () => {
        setSelectedTemplateForAI(template);
        setAiTopic("");
        setAiContext("");
        setIsAIDialogOpen(true);
      }, "AI Populate on this premium template");
    }
    setSelectedTemplateForAI(template);
    setAiTopic("");
    setAiContext("");
    setIsAIDialogOpen(true);
  };

  // ─── Render ───

  return (
    <div className="w-full flex flex-col gap-6 relative p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20">
              <Layers className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Templates</h1>
              <p className="text-sm text-muted-foreground">
                Start fast with curated presentation blueprints
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Tabs + Search & Sort */}
        <div className="flex items-center gap-3">
          {/* Gallery Tab Switcher */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            {([
              { key: "browse" as GalleryTab, label: "Browse", icon: Layers },
              { key: "my-templates" as GalleryTab, label: "My Templates", icon: User },
              { key: "community" as GalleryTab, label: "Community", icon: Globe },
            ]).map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.key}
                  variant="ghost"
                  size="sm"
                  onClick={() => setGalleryTab(tab.key)}
                  className={`text-xs rounded-md transition-all gap-1.5 ${galleryTab === tab.key
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Icon className="h-3 w-3" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/60 backdrop-blur-sm border-border/50"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-0.5">
            {(["popular", "newest", "rating"] as const).map((s) => (
              <Button
                key={s}
                variant="ghost"
                size="sm"
                onClick={() => setSortBy(s)}
                className={`text-xs capitalize rounded-md transition-all ${sortBy === s
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {s}
              </Button>
            ))}
          </div>
          <LayoutSwitcher />
        </div>
      </div>

      {/* Category Tabs — only visible in browse mode */}
      {galleryTab === "browse" && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${selectedCategory === cat.key
                    ? "bg-violet-500/15 text-violet-400 border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                    : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/60 hover:text-foreground"
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ═══ Browse Tab ═══ */}
      {galleryTab === "browse" && (
        <>
          {/* Template Grid */}
          {isLoading && templates.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/50 bg-muted/20 animate-pulse h-[280px]"
                />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Layers className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg text-muted-foreground">No templates found</p>
              <p className="text-sm text-muted-foreground/60">
                Try a different search or category
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              layout
              transition={{ layout: { duration: 0.4, ease: "easeOut" } }}
              className={cn(
                "w-full transition-all duration-500",
                layout === 'grid' && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
                layout === 'list' && "flex flex-col gap-4",
                layout === 'showcase' && "grid grid-cols-1 md:grid-cols-2 gap-8"
              )}
            >
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isFavorited={favoriteIds.has(template.id)}
                  isPending={isPending}
                  onpreview={() => handlePreview(template)}
                  onUse={() => handleUseTemplate(template.id, template.isPremium)}
                  onAIPopulate={() => handleOpenAIDialog(template)}
                  onToggleFavorite={() => handleToggleFavorite(template.id)}
                  onRate={() => openRatingDialog(template.id)}
                />
              ))}
            </motion.div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4 pb-8">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="rounded-full px-6"
              >
                {isLoading ? "Loading..." : "Load More Templates"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* ═══ My Templates Tab ═══ */}
      {galleryTab === "my-templates" && (
        <>
          {isMyTemplatesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/50 bg-muted/20 animate-pulse h-[280px]"
                />
              ))}
            </div>
          ) : myTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <User className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-lg text-muted-foreground">No templates yet</p>
              <p className="text-sm text-muted-foreground/60">
                Open a presentation and click the{" "}
                <span className="inline-flex items-center gap-1 font-medium text-violet-400">
                  <Layers className="h-3 w-3" /> Save as Template
                </span>{" "}
                button to create one.
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              layout
              transition={{ layout: { duration: 0.4, ease: "easeOut" } }}
              className={cn(
                "w-full transition-all duration-500",
                layout === 'grid' && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
                layout === 'list' && "flex flex-col gap-4",
                layout === 'showcase' && "grid grid-cols-1 md:grid-cols-2 gap-8"
              )}
            >
              {myTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isFavorited={favoriteIds.has(template.id)}
                  isPending={isPending}
                  onpreview={() => handlePreview(template)}
                  onUse={() => handleUseTemplate(template.id)}
                  onAIPopulate={() => handleOpenAIDialog(template)}
                  onToggleFavorite={() => handleToggleFavorite(template.id)}
                  isOwned
                  onDelete={() => handleDeleteUserTemplate(template.id)}
                />
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* ═══ Community Tab ═══ */}
      {galleryTab === "community" && (
        <>
          {isLoading && templates.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/50 bg-muted/20 animate-pulse h-[280px]"
                />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              layout
              transition={{ layout: { duration: 0.4, ease: "easeOut" } }}
              className={cn(
                "w-full transition-all duration-500",
                layout === 'grid' && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
                layout === 'list' && "flex flex-col gap-4",
                layout === 'showcase' && "grid grid-cols-1 md:grid-cols-2 gap-8"
              )}
            >
              {templates
                .filter((t) => t.authorName !== "Verto AI")
                .map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isFavorited={favoriteIds.has(template.id)}
                    isPending={isPending}
                    onpreview={() => handlePreview(template)}
                    onUse={() => handleUseTemplate(template.id)}
                    onAIPopulate={() => handleOpenAIDialog(template)}
                    onToggleFavorite={() => handleToggleFavorite(template.id)}
                    onRate={() => openRatingDialog(template.id)}
                  />
                ))}
              {templates.filter((t) => t.authorName !== "Verto AI").length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                  <Globe className="h-12 w-12 text-muted-foreground/40" />
                  <p className="text-lg text-muted-foreground">
                    No community templates yet
                  </p>
                  <p className="text-sm text-muted-foreground/60">
                    Be the first to share a template with the community!
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={isPreviewOpen}
        slideIndex={previewSlideIndex}
        isFavorited={
          previewTemplate ? favoriteIds.has(previewTemplate.id) : false
        }
        isPending={isPending}
        onClose={() => setIsPreviewOpen(false)}
        onSlideChange={setPreviewSlideIndex}
        onUse={() => previewTemplate && handleUseTemplate(previewTemplate.id, previewTemplate.isPremium)}
        onAIPopulate={() =>
          previewTemplate && handleOpenAIDialog(previewTemplate)
        }
        onToggleFavorite={() =>
          previewTemplate && handleToggleFavorite(previewTemplate.id)
        }
      />

      {/* AI Populate Dialog */}
      <AIPopulateDialog
        isOpen={isAIDialogOpen}
        template={selectedTemplateForAI}
        topic={aiTopic}
        context={aiContext}
        isGenerating={isGenerating}
        onClose={() => setIsAIDialogOpen(false)}
        onTopicChange={setAiTopic}
        onContextChange={setAiContext}
        onGenerate={handleAIPopulate}
      />

      {/* Premium Upsell Dialog */}
      <PremiumUpsellDialog
        isOpen={isPremiumDialogOpen}
        onClose={() => setIsPremiumDialogOpen(false)}
        feature={premiumFeatureText}
      />

      {/* Rating Dialog */}
      <Dialog open={isRatingOpen} onOpenChange={() => setIsRatingOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Rate this template</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setPendingRating(star)}
                className="transition-all hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${star <= pendingRating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                    }`}
                />
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRatingOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={pendingRating < 1}
              onClick={handleRateTemplate}
              className="gap-1.5"
            >
              <Star className="h-3.5 w-3.5" /> Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TEMPLATE CARD COMPONENT
// ═══════════════════════════════════════════════════════════

function TemplateCard({
  template,
  isFavorited,
  isPending,
  onpreview,
  onUse,
  onAIPopulate,
  onToggleFavorite,
  onRate,
  isOwned,
  onDelete,
}: {
  template: TemplateListItem;
  isFavorited: boolean;
  isPending: boolean;
  onpreview: () => void;
  onUse: () => void;
  onAIPopulate: () => void;
  onToggleFavorite: () => void;
  onRate?: () => void;
  isOwned?: boolean;
  onDelete?: () => void;
}) {
  const { layout } = useLayoutStore();
  const isList = layout === 'list';
  const isShowcase = layout === 'showcase';

  const catInfo = CATEGORIES.find((c) => c.key === template.category);
  const CatIcon = catInfo?.icon || Layers;
  const rating =
    template.ratingCount > 0
      ? (template.ratingSum / template.ratingCount).toFixed(1)
      : null;

  return (
    <motion.div
      variants={cardVariants}
      layout
      transition={{ layout: { duration: 0.4, ease: "easeOut" } }}
      style={{ borderRadius: 32 }}
      className={cn(
        "group relative border border-black/[0.03] dark:border-white/[0.05] bg-white/80 dark:bg-black/40 backdrop-blur-xl overflow-hidden hover:border-violet-500/30 hover:shadow-[0_8px_40px_rgba(139,92,246,0.12)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] hover:-translate-y-1 p-3 transition-transform duration-500 ease-out",
        isList ? "flex flex-row items-center gap-4 h-auto" : "flex flex-col h-full",
        isShowcase && "p-4 gap-y-4"
      )}
    >
      {/* Apple-style Inner Highlight */}
      <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-black/5 dark:ring-white/5 pointer-events-none z-10" />

      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none rounded-[32px]" />

      {/* Badges */}
      <div className="absolute top-5 left-5 flex items-center gap-1.5 z-20">
        {template.isPremium && (
          <Badge className="bg-amber-500/90 text-black text-[10px] font-bold px-1.5 py-0 gap-0.5 border-0">
            <Crown className="h-2.5 w-2.5" /> PRO
          </Badge>
        )}
        {template.isNew && (
          <Badge className="bg-emerald-500/90 text-black text-[10px] font-bold px-1.5 py-0 border-0">
            NEW
          </Badge>
        )}
        {template.isFeatured && (
          <Badge className="bg-violet-500/90 text-white text-[10px] font-bold px-1.5 py-0 gap-0.5 border-0">
            <Star className="h-2.5 w-2.5" /> Featured
          </Badge>
        )}
        {isOwned && (
          <Badge className="bg-sky-500/90 text-white text-[10px] font-bold px-1.5 py-0 border-0">
            MINE
          </Badge>
        )}
      </div>

      {/* Favorite + Delete buttons */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-1">
        {isOwned && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this template permanently?")) {
                onDelete();
              }
            }}
            className="p-1.5 rounded-full bg-background/70 backdrop-blur-sm border border-border/50 transition-all hover:scale-110 hover:bg-destructive/20"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="p-1.5 rounded-full bg-background/70 backdrop-blur-sm border border-border/50 transition-all hover:scale-110"
        >
          <Heart
            className={`h-3.5 w-3.5 transition-colors ${isFavorited
                ? "text-rose-500 fill-rose-500"
                : "text-muted-foreground"
              }`}
          />
        </button>
      </div>

      {/* Thumbnail area */}
      <motion.div
        layout="position"
        transition={{ layout: { duration: 0.4, ease: "easeOut" } }}
        className={cn(
          "bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center cursor-pointer relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/5 z-10 shrink-0",
          isList ? "w-32 sm:w-48 aspect-16/10" : "w-full aspect-16/10",
          !isList && !isShowcase && "h-40"
        )}
        onClick={onpreview}
      >
        <div className="flex items-center gap-1.5 text-muted-foreground/60">
          <CatIcon className="h-8 w-8" />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-2 z-20">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full text-xs h-8 gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onpreview();
            }}
          >
            <Eye className="h-3 w-3" /> Preview
          </Button>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div layout="position" transition={{ layout: { duration: 0.4, ease: "easeOut" } }} className={cn("px-2 pb-1 flex flex-col gap-3 flex-1 z-10", isList ? "py-2 justify-center" : "pt-4")}>
        <div>
          <h3 className={cn("font-semibold text-foreground truncate", isList ? "text-lg" : "text-sm")}>
            {template.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
            {template.description}
          </p>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" /> {template.slideCount} slides
            </span>
            {rating ? (
              <button
                className="flex items-center gap-0.5 hover:text-amber-400 transition-colors"
                onClick={() => onRate?.()}
              >
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />{" "}
                {rating}
              </button>
            ) : onRate ? (
              <button
                className="flex items-center gap-0.5 hover:text-amber-400 transition-colors"
                onClick={() => onRate()}
              >
                <Star className="h-3 w-3" /> Rate
              </button>
            ) : null}
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ${DIFFICULTY_COLORS[template.difficulty]
              }`}
          >
            {template.difficulty.toLowerCase()}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 rounded-lg text-xs h-8 gap-1"
            disabled={isPending}
            onClick={onUse}
          >
            {template.isPremium && <Crown className="h-3 w-3 text-amber-400" />}
            <Copy className="h-3 w-3" /> Use As-Is
          </Button>
          <Button
            size="sm"
            className="flex-1 rounded-lg text-xs h-8 gap-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0"
            onClick={onAIPopulate}
          >
            <Bot className="h-3 w-3" /> AI Fill
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════
// TEMPLATE PREVIEW MODAL
// ═══════════════════════════════════════════════════════════

function TemplatePreviewModal({
  template,
  isOpen,
  slideIndex,
  isFavorited,
  isPending,
  onClose,
  onSlideChange,
  onUse,
  onAIPopulate,
  onToggleFavorite,
}: {
  template: any;
  isOpen: boolean;
  slideIndex: number;
  isFavorited: boolean;
  isPending: boolean;
  onClose: () => void;
  onSlideChange: (i: number) => void;
  onUse: () => void;
  onAIPopulate: () => void;
  onToggleFavorite: () => void;
}) {
  if (!template) return null;

  const slides: Slide[] = template.slides || [];
  const currentSlide = slides[slideIndex];
  const catInfo = CATEGORIES.find((c) => c.key === template.category);
  const CatIcon = catInfo?.icon || Layers;
  const rating =
    template.ratingCount > 0
      ? (template.ratingSum / template.ratingCount).toFixed(1)
      : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <CatIcon className="h-4 w-4 text-violet-400" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{template.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {catInfo?.label} • {template.slideCount} slides
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFavorite}
                className="gap-1 rounded-full"
              >
                <Heart
                  className={`h-4 w-4 ${isFavorited
                      ? "text-rose-500 fill-rose-500"
                      : "text-muted-foreground"
                    }`}
                />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Slide Preview */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/10">
              <div className="w-full max-w-2xl aspect-video bg-gradient-to-br from-muted/40 via-muted/20 to-muted/30 rounded-xl border border-border/40 flex flex-col items-center justify-center p-8 shadow-lg">
                {currentSlide ? (
                  <div className="text-center space-y-4">
                    <Badge variant="outline" className="text-xs">
                      {currentSlide.type}
                    </Badge>
                    <h3 className="text-xl font-semibold text-foreground">
                      {currentSlide.slideName}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Slide {slideIndex + 1} of {slides.length}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No slides available</p>
                )}
              </div>

              {/* Slide navigation */}
              <div className="flex items-center gap-4 mt-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onSlideChange(Math.max(0, slideIndex - 1))
                  }
                  disabled={slideIndex === 0}
                  className="rounded-full h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => onSlideChange(i)}
                      className={`h-2 rounded-full transition-all duration-200 ${i === slideIndex
                          ? "w-6 bg-violet-500"
                          : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        }`}
                    />
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onSlideChange(Math.min(slides.length - 1, slideIndex + 1))
                  }
                  disabled={slideIndex >= slides.length - 1}
                  className="rounded-full h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-72 border-l border-border/50 flex flex-col overflow-y-auto">
              <div className="p-5 space-y-5 flex-1">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Meta */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Theme</span>
                    <span className="font-medium text-foreground">
                      {template.themeName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${DIFFICULTY_COLORS[
                        template.difficulty as TemplateDifficulty
                        ]
                        }`}
                    >
                      {template.difficulty?.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Used</span>
                    <span className="font-medium text-foreground">
                      {template.usageCount}x
                    </span>
                  </div>
                  {rating && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        {rating}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {template.tags?.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px] bg-muted/40"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Slide list */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Slides
                  </h4>
                  <div className="space-y-1">
                    {slides.map((slide, i) => (
                      <button
                        key={i}
                        onClick={() => onSlideChange(i)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${i === slideIndex
                            ? "bg-violet-500/15 text-violet-400 font-medium"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                      >
                        <span className="opacity-50 mr-2">{i + 1}.</span>
                        {slide.slideName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 border-t border-border/50 space-y-2">
                <Button
                  className="w-full rounded-lg gap-2"
                  disabled={isPending}
                  onClick={onUse}
                >
                  <Copy className="h-4 w-4" /> Use As-Is
                </Button>
                <Button
                  className="w-full rounded-lg gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0"
                  onClick={onAIPopulate}
                >
                  <Bot className="h-4 w-4" /> AI Populate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════
// AI POPULATE DIALOG
// ═══════════════════════════════════════════════════════════

function AIPopulateDialog({
  isOpen,
  template,
  topic,
  context,
  isGenerating,
  onClose,
  onTopicChange,
  onContextChange,
  onGenerate,
}: {
  isOpen: boolean;
  template: TemplateListItem | null;
  topic: string;
  context: string;
  isGenerating: boolean;
  onClose: () => void;
  onTopicChange: (v: string) => void;
  onContextChange: (v: string) => void;
  onGenerate: () => void;
}) {
  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
              <Bot className="h-4 w-4 text-violet-400" />
            </div>
            AI Populate Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="font-medium">{template.name}</span>
              <Badge variant="outline" className="text-[10px] ml-auto">
                {template.slideCount} slides
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              AI will use this template&apos;s structure and fill it with your
              topic-specific content.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What&apos;s your topic? *
            </label>
            <Input
              placeholder="e.g., AI-powered customer support startup"
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              className="bg-background/60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Additional context{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Textarea
              placeholder="e.g., Focus on B2B market, seed stage, $2M ARR..."
              value={context}
              onChange={(e) => onContextChange(e.target.value)}
              className="bg-background/60 min-h-[80px]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-lg"
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={onGenerate}
              disabled={!topic.trim() || isGenerating}
              className="flex-1 rounded-lg gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
