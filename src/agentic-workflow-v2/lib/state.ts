// lib/state.ts - State Management for Advanced Workflow

import type { StreamEvent } from '@/lib/streaming/EventEmitter'

/**
 * Content item within a slide (nested structure)
 */
export interface FinalSlideContent {
  id: string;
  type: string;
  name: string;
  content: string | string[] | FinalSlideContent[];
  placeholder?: string;
  className?: string;
  alt?: string;
  restrictToDrop?: boolean;
  restrictDropTo?: boolean;
  [key: string]: any; // Allow additional properties
}

/**
 * Complete slide structure
 */
export interface Slide {
  id: string;
  slideName: string;
  type: string;
  className: string;
  content: FinalSlideContent;
}

/**
 * Data tracked for each slide during generation
 */
export interface SlideGenerationData {
  outline: string;
  slideTitle: string | null;
  subtitle?: string;
  slideContent: string | null;
  layoutType: string | null;
  imageQuery: string | null;
  imageUrl: string | null;
  finalJson: FinalSlideContent | null;
  validationStatus: 'pending' | 'valid' | 'invalid';

  // === Structured content fields for premium layouts ===
  // For bigNumberLayout / statsRow
  statValue?: string;
  statLabel?: string;
  // For statsRow / bentoGrid (multiple stats)
  stats?: { value: string; label: string }[];
  // For comparisonLayout
  comparisonLabelA?: string;
  comparisonLabelB?: string;
  comparisonPointsA?: string[];
  comparisonPointsB?: string[];
  // For quoteLayout
  quoteText?: string;
  quoteAttribution?: string;
  // For processFlow / timelineLayout / timeline
  processSteps?: { stepTitle: string; stepDescription?: string }[];
  // For iconGrid / bentoGrid
  gridItems?: { icon: string; itemTitle: string; itemDescription: string }[];
  // For callToAction / creativeHero
  ctaButtonText?: string;
  // For sectionDivider
  sectionNumber?: string;
  // For columnsWithHeadings
  columnHeadings?: string[];
}

/**
 * Main state object for the advanced presentation graph
 */
export interface AdvancedPresentationState {
  // Input Data
  generationRunId?: string;
  projectId: string | null;
  userId: string;
  userInput: string;
  additionalContext?: string;
  themePreference: string; // Theme name from src/lib/constants.ts

  // Streaming
  streamEventHandler?: (event: StreamEvent) => void;

  // Generation Progress
  outlines: string[] | null;
  slideData: SlideGenerationData[];

  // Output
  finalPresentationJson: Slide[] | null;

  // Metadata & Error Handling
  error: string | null;
  currentStep: string;
  progress: number; // 0-100
  retryCount: number;
}

/**
 * Layout template information
 */
export interface LayoutTemplate {
  type: string;
  slideName: string;
  className: string;
  requiresImage: boolean;
  contentStructure: 
    | 'title-only' 
    | 'title-content' 
    | 'two-column' 
    | 'three-column'
    | 'four-column'
    | 'image-text'
    | 'image-grid'
    | 'stat-showcase'
    | 'comparison'
    | 'quote'
    | 'timeline'
    | 'image-overlay'
    | 'feature-grid'
    | 'divider'
    | 'process'
    | 'cta';
}
