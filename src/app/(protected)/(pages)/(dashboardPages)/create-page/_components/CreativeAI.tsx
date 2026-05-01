"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { createProject } from "@/actions/projects";
import { Loader2, ChevronLeft, RotateCcw, Sparkles, Database, Zap, ArrowLeft, ChevronRight, Lightbulb } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { OutlineCard } from "@/lib/types";
import useCreativeAIStore from "@/store/useCreativeAiStore";
import { v4 as uuidv4 } from "uuid";
import usePromptStore from "@/store/usePromptStore";
import { useSlideStore } from "@/store/useSlideStore";
import { generateCreativePrompt } from "@/actions/genai";
import { CardList } from "./common/CardList";
import { useUsageLimit } from "@/hooks/use-usage-limit";

type CreateAIProps = {
  onBack: () => void;
};

export default function CreateAI({ onBack }: CreateAIProps) {
  const { toast } = useToast();
  const { checkUsage, UsageModal } = useUsageLimit();
  const router = useRouter();
  const [editText, setEditText] = useState("");
  const { addPrompt } = usePromptStore();
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [noOfCards, setNoOfCards] = useState(0);
  const { setProject } = useSlideStore();

  const {
    outlines,
    addOutline,
    addMultipleOutlines,
    resetOutlines,
    currentAiPrompt,
    setCurrentAiPrompt,
  } = useCreativeAIStore();

  const generateOutline = async () => {
    if (currentAiPrompt === "") {
      toast({
        title: "Error",
        description: "Please enter a prompt to generate an outline.",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingOutline(true);

    const res = await generateCreativePrompt(currentAiPrompt);
    if (res.status === 200 && res?.data?.outlines) {
      const cardsData: OutlineCard[] = [];
      res?.data?.outlines.map((outline: string, idx: number) => {
        const newCard = {
          id: uuidv4(),
          title: outline,
          order: idx + 1,
        };
        cardsData.push(newCard);
      });
      addMultipleOutlines(cardsData);
      setNoOfCards(cardsData.length);
      toast({
        title: "Success",
        description: "Outline generated successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to generate outline. Please try again.",
        variant: "destructive",
      });
    }
    setIsGeneratingOutline(false);
  };

  const resetCards = () => {
    setEditingCard(null);
    setSelectedCard(null);
    setEditText("");
    setCurrentAiPrompt("");
    resetOutlines();
    setNoOfCards(0);
  };

  const handleGenerate = async () => {
    if (outlines.length === 0 || noOfCards === 0) {
      toast({
        title: "Error",
        description: "Please select at least one card to generate PPT",
        variant: "destructive",
      });
      return;
    }

    const canGenerate = await checkUsage();
    if (!canGenerate) return;

    try {
      setIsCreatingProject(true);
      const selectedOutlines = outlines.slice(0, noOfCards);
      
      const res = await createProject(
        currentAiPrompt || selectedOutlines[0]?.title || "Untitled Presentation",
        selectedOutlines
      );

      if (res.status !== 200 || !res.data) {
        throw new Error(res.error || "Failed to create project");
      }

      addPrompt({
        id: uuidv4(),
        title: currentAiPrompt || selectedOutlines[0]?.title || "Untitled Presentation",
        outlines: selectedOutlines,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Project created! Navigating to theme selection...",
      });

      setProject(res.data as any);
      router.push(`/presentation/${res.data.id}/select-theme`);

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create presentation",
        variant: "destructive",
      });
      setIsCreatingProject(false);
    }
  };

  useEffect(() => {
    setNoOfCards(outlines.length);
  }, [outlines.length]);

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen flex flex-col items-center pt-12 pb-20 px-6 max-w-7xl mx-auto space-y-16"
      >
        {/* Editorial Header */}
        <motion.div variants={itemVariants} className="w-full flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isCreatingProject}
            className="gap-2 text-muted-foreground/60 hover:text-foreground hover:bg-muted/30 rounded-full px-5 h-9 text-xs font-semibold transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            Dashboard
          </Button>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
            <Zap className="w-3 h-3" />
            Creative Engine v1.2
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full grid lg:grid-cols-12 gap-20">
          {/* Configuration Column */}
          <div className="lg:col-span-6 space-y-16">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Creative <span className="text-muted-foreground">Synthesis.</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Transform your concept into a structured narrative. Our creative AI researches and architectures your deck section by section.
              </p>
            </div>

            <div className="space-y-12">
              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Core Narrative</label>
                <div className="relative">
                  <Input
                    placeholder="Describe your presentation goal..."
                    value={currentAiPrompt}
                    onChange={(e) => setCurrentAiPrompt(e.target.value)}
                    disabled={isGeneratingOutline || isCreatingProject}
                    className="text-lg font-medium tracking-tight h-auto py-1 bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/20 px-0"
                  />
                  <div className="h-px w-full bg-border/40 relative mt-1 overflow-hidden">
                     <motion.div className="absolute inset-y-0 left-0 bg-foreground" animate={{ width: currentAiPrompt ? '100%' : '2%' }} transition={{ duration: 0.8 }} />
                  </div>
                </div>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-2 gap-8 items-end">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Structure Density</label>
                  <Select
                    value={noOfCards.toString()}
                    onValueChange={(value) => setNoOfCards(parseInt(value))}
                    disabled={isCreatingProject}
                  >
                    <SelectTrigger className="w-full h-10 bg-transparent border-border/40 rounded-xl focus:ring-0 text-xs font-bold uppercase tracking-wider">
                      <SelectValue placeholder="Cards count" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40">
                      {outlines.length === 0 ? (
                        <SelectItem value="0" className="text-xs">No cards</SelectItem>
                      ) : (
                        Array.from({ length: outlines.length }, (_, idx) => idx + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()} className="text-xs">
                            {num} {num === 1 ? "Section" : "Sections"}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    onClick={resetCards}
                    disabled={isCreatingProject || !outlines.length}
                    className="gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Workspace
                  </Button>
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <Button
                  onClick={generateOutline}
                  disabled={isGeneratingOutline || isCreatingProject}
                  className="w-full h-14 text-sm font-bold rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="relative flex items-center justify-center gap-3">
                    {isGeneratingOutline ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating Outline...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 fill-current" />
                        Generate Outline
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>

                {outlines?.length > 0 && (
                  <Button 
                    className="w-full h-14 text-sm font-bold rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/30 transition-all duration-300 group"
                    onClick={handleGenerate} 
                    disabled={isCreatingProject || isGeneratingOutline}
                  >
                    <span className="flex items-center justify-center gap-3">
                      {isCreatingProject ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Assembling...
                        </>
                      ) : (
                        <>
                          Finalize & Choose Theme
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </Button>
                )}
              </div>

              <div className="p-6 rounded-3xl bg-muted/5 border border-border/20 flex gap-4 items-start">
                 <Lightbulb className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
                 <p className="text-[10px] text-muted-foreground leading-relaxed font-medium uppercase tracking-wider">
                   Pro Tip: You can double-click any generated card to refine its title, or drag to reorder the presentation flow.
                 </p>
              </div>
            </div>
          </div>

          {/* Outline View Column */}
          <div className="lg:col-span-6">
            <div className="bg-muted/5 border border-border/30 rounded-[2.5rem] p-10 space-y-10 h-[650px] sticky top-12 flex flex-col">
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold tracking-tight">Presentation Outline</h3>
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                  {outlines.length} {outlines.length === 1 ? "Section" : "Sections"} Synthesized
                </p>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 -mx-2">
                <CardList
                  outlines={outlines}
                  addOutline={addOutline}
                  addMultipleOutlines={addMultipleOutlines}
                  editingCard={editingCard}
                  selectedCard={selectedCard}
                  editText={editText}
                  onEditChange={setEditText}
                  onCardSelect={setSelectedCard}
                  onCardDoubleClick={(id, title) => {
                    setEditingCard(id);
                    setEditText(title);
                  }}
                  setEditText={setEditText}
                  setEditingCard={setEditingCard}
                  setSelectedCard={setSelectedCard}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <UsageModal />
    </>
  );
}
