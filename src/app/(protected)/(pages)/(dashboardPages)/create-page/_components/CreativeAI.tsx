"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronLeft, RotateCcw } from "lucide-react";
import { containerVariants, itemVariants, themes } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { OutlineCard, Theme } from "@/lib/types";
import useCreativeAIStore from "@/store/useCreativeAiStore";
import { v4 as uuidv4 } from "uuid";
import usePromptStore from "@/store/usePromptStore";
import { generateCreativePrompt } from "@/actions/genai";
import { CardList } from "./common/CardList";
import InlineThemeSelector from "./common/InlineThemeSelector";
import { useAgenticGenerationV2 } from "@/hooks/useAgenticGenerationV2";
import AgenticWorkflowDialog from "@/components/global/agentic-workflow/AgenticWorkflowDialog";

type CreateAIProps = {
  onBack: () => void;
};

export default function CreateAI({ onBack }: CreateAIProps) {
  const { toast } = useToast();
  const [editText, setEditText] = useState("");
  const { addPrompt } = usePromptStore();
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [noOfCards, setNoOfCards] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);

  const {
    outlines,
    addOutline,
    addMultipleOutlines,
    resetOutlines,
    currentAiPrompt,
    setCurrentAiPrompt,
  } = useCreativeAIStore();

  const {
    generate,
    isGenerating,
    progress,
    currentAgentName,
    currentAgentDescription,
    agentSteps,
    runId,
  } = useAgenticGenerationV2();

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
    if (outlines.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one card to generate PPT",
        variant: "destructive",
      });
      return;
    }

    const selectedOutlines = outlines.slice(0, noOfCards).map((outline) => outline.title);

    try {
      await generate(
        currentAiPrompt,
        undefined,
        selectedTheme.name,
        selectedOutlines
      );

      addPrompt({
        id: uuidv4(),
        title: currentAiPrompt || selectedOutlines[0],
        outlines,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Presentation generation started",
      });

      setCurrentAiPrompt("");
      resetOutlines();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate presentation",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    onBack();
  };

  useEffect(() => {
    setNoOfCards(outlines.length);
  }, [outlines.length]);

  return (
    <>
      <motion.div
        className="space-y-6 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Button onClick={handleBack} variant="outline" className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">
            Generate with <span className="text-vivid">Creative AI</span>
          </h1>
          <p className="text-secondary">Create your outline, pick a theme, and generate in one flow.</p>
        </motion.div>
        <motion.div
          className="bg-primary/10 p-4 rounded-xl"
          variants={itemVariants}
        >
          <div className="flex flex-col sm:flex-row justify-between gap-3 items-center rounded-xl">
            <Input
              value={currentAiPrompt}
              onChange={(e) => setCurrentAiPrompt(e.target.value)}
              placeholder="Enter a topic or prompt..."
              className="text-base sm:text-xl border-0 focus-visible:ring-0 shadow-none p-0 bg-transparent grow"
              required
              disabled={isGenerating}
            />

            <div className="flex items-center gap-3">
              <Select
                value={noOfCards.toString()}
                onValueChange={(value) => setNoOfCards(parseInt(value))}
                disabled={isGenerating}
              >
                <SelectTrigger className="w-fit gap-2 font-semibold shadow-xl">
                  <SelectValue placeholder="Select number of cards" />
                </SelectTrigger>
                <SelectContent className="w-fit">
                  {outlines.length === 0 ? (
                    <SelectItem value="0" className="font-semibold">
                      No cards
                    </SelectItem>
                  ) : (
                    Array.from(
                      { length: outlines.length },
                      (_, idx) => idx + 1
                    ).map((num) => (
                      <SelectItem
                        key={num}
                        value={num.toString()}
                        className="font-semibold"
                      >
                        {num} {num === 1 ? "Card" : "Cards"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                variant="destructive"
                onClick={resetCards}
                size="icon"
                aria-label="Reset cards"
                disabled={isGenerating}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="w-full flex justify-center items-center">
          <Button
            className="font-medium text-lg flex gap-2 items-center"
            onClick={generateOutline}
            disabled={isGeneratingOutline || isGenerating}
          >
            {isGeneratingOutline ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Generating...
              </>
            ) : (
              "Generate Outline"
            )}
          </Button>
        </div>

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

        {outlines.length > 0 && (
          <motion.div variants={itemVariants}>
            <InlineThemeSelector
              themes={themes}
              selectedTheme={selectedTheme}
              onThemeSelect={setSelectedTheme}
              disabled={isGenerating}
            />
          </motion.div>
        )}

        {outlines?.length > 0 && (
          <Button className="w-full" onClick={handleGenerate} disabled={isGenerating || isGeneratingOutline}>
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Generating...
              </>
            ) : (
              "Generate Presentation"
            )}
          </Button>
        )}
      </motion.div>

      <AgenticWorkflowDialog
        open={isGenerating}
        onOpenChange={() => {}}
        topic={currentAiPrompt || "Your Presentation"}
        steps={agentSteps}
        currentProgress={progress}
        currentAgentName={currentAgentName}
        currentAgentDescription={currentAgentDescription}
        runId={runId}
      />
    </>
  );
}
