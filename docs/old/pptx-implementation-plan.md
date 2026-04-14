# PPTX Format Implementation Plan

## Overview

This document outlines the complete implementation plan for adding Microsoft PowerPoint (PPTX) format support to the existing PPT Maker application. The goal is to enable:

1. **Export** - Download presentations as `.pptx` files
2. **Import** - Upload and parse existing `.pptx` files
3. **Render** - Display PPTX content in the editor
4. **Edit/Modify** - Full editing capabilities like Microsoft PowerPoint

---

## Table of Contents

1. [Current Architecture Analysis](#current-architecture-analysis)
2. [Technology Stack](#technology-stack)
3. [Phase 1: PPTX Export](#phase-1-pptx-export)
4. [Phase 2: PPTX Import & Parsing](#phase-2-pptx-import--parsing)
5. [Phase 3: Advanced Editing Features](#phase-3-advanced-editing-features)
6. [Phase 4: Real-time Collaboration](#phase-4-real-time-collaboration)
7. [Database Schema Changes](#database-schema-changes)
8. [File Structure](#file-structure)
9. [Implementation Timeline](#implementation-timeline)
10. [API Endpoints](#api-endpoints)
11. [Component Architecture](#component-architecture)
12. [Testing Strategy](#testing-strategy)

---

## Current Architecture Analysis

### Existing Structure

Your app already has a solid foundation:

| Feature | Current Implementation |
|---------|----------------------|
| Slide Store | Zustand with persist middleware (`useSlideStore.tsx`) |
| Slide Types | `Slide`, `ContentItem`, `Theme` interfaces in `types.ts` |
| Layouts | 20+ predefined layouts in `slideLayouts.tsx` |
| Editor Components | Recursive component system (`MasterRecursiveComponent.tsx`) |
| Drag & Drop | react-dnd with HTML5Backend |
| Database | PostgreSQL with Prisma (slides stored as JSON) |
| Existing Library | **pptxgenjs v4.0.0** already installed! |

### Content Types Supported

```typescript
// Already supported in your app
type ContentType =
  | "column" | "resizable-column" | "text" | "paragraph"
  | "image" | "table" | "multiColumn" | "blank"
  | "heading1" | "heading2" | "heading3" | "heading4" | "title"
  | "blockquote" | "numberedList" | "bulletedList" | "code"
  | "calloutBox" | "todoList" | "divider" | "tableOfContents"
  | "statBox" | "timelineCard" | "customButton";
```

---

## Technology Stack

### Core Libraries

| Library | Purpose | Status |
|---------|---------|--------|
| **pptxgenjs** | PPTX generation/export | ✅ Already installed |
| **jszip** | Unzip PPTX files for parsing | ✅ Dependency of pptxgenjs |
| **xml2js** | Parse PPTX XML content | 📦 Need to install |
| **mammoth** (optional) | Advanced DOCX/PPTX parsing | 📦 Optional |

### Additional Dependencies to Install

```bash
bun add xml2js @types/xml2js file-saver @types/file-saver fast-xml-parser
```

---

## Phase 1: PPTX Export

### 1.1 Core Export Service

Create a service to convert your internal slide format to PPTX.

**File: `src/lib/pptx/exporter.ts`**

```typescript
import PptxGenJS from 'pptxgenjs';
import { Slide, ContentItem, Theme } from '@/lib/types';

export interface ExportOptions {
  title?: string;
  author?: string;
  subject?: string;
  company?: string;
  revision?: string;
}

export class PPTXExporter {
  private pptx: PptxGenJS;
  private theme: Theme;

  constructor(theme: Theme, options?: ExportOptions) {
    this.pptx = new PptxGenJS();
    this.theme = theme;
    this.initializePresentation(options);
  }

  private initializePresentation(options?: ExportOptions) {
    this.pptx.author = options?.author || 'PPT Maker';
    this.pptx.title = options?.title || 'Presentation';
    this.pptx.subject = options?.subject || '';
    this.pptx.company = options?.company || '';
    
    // Set slide size (16:9 widescreen)
    this.pptx.defineLayout({ 
      name: 'CUSTOM', 
      width: 13.33, 
      height: 7.5 
    });
    this.pptx.layout = 'CUSTOM';
  }

  public async exportSlides(slides: Slide[]): Promise<Blob> {
    for (const slide of slides) {
      await this.addSlide(slide);
    }
    return await this.pptx.write({ outputType: 'blob' }) as Blob;
  }

  private async addSlide(slideData: Slide): Promise<void> {
    const slide = this.pptx.addSlide();
    
    // Apply theme
    slide.background = { color: this.hexToRgb(this.theme.backgroundColor) };
    
    // Process content recursively
    await this.processContent(slide, slideData.content, {
      x: 0.5,
      y: 0.5,
      w: 12.33,
      h: 6.5
    });
  }

  private async processContent(
    slide: PptxGenJS.Slide,
    content: ContentItem,
    bounds: { x: number; y: number; w: number; h: number }
  ): Promise<void> {
    // Content type mapping logic
    switch (content.type) {
      case 'title':
        this.addTitle(slide, content, bounds);
        break;
      case 'heading1':
      case 'heading2':
      case 'heading3':
      case 'heading4':
        this.addHeading(slide, content, bounds);
        break;
      case 'paragraph':
      case 'text':
        this.addText(slide, content, bounds);
        break;
      case 'image':
        await this.addImage(slide, content, bounds);
        break;
      case 'bulletedList':
      case 'numberedList':
        this.addList(slide, content, bounds);
        break;
      case 'table':
        this.addTable(slide, content, bounds);
        break;
      case 'column':
      case 'resizable-column':
        await this.processColumnContent(slide, content, bounds);
        break;
      // Add more cases...
    }
  }

  private addTitle(slide: PptxGenJS.Slide, content: ContentItem, bounds: any) {
    slide.addText(content.content as string || content.placeholder || '', {
      x: bounds.x,
      y: bounds.y,
      w: bounds.w,
      h: 1,
      fontSize: 44,
      fontFace: this.theme.fontFamily.replace(/'/g, ''),
      color: this.hexToRgb(this.theme.fontColor),
      bold: true,
      align: 'center',
    });
  }

  // ... more methods
}
```

### 1.2 Export UI Component

**File: `src/components/global/ExportButton.tsx`**

```typescript
'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileDown, Image, FileText } from 'lucide-react';
import { useSlideStore } from '@/store/useSlideStore';
import { PPTXExporter } from '@/lib/pptx/exporter';
import { toast } from 'sonner';

export function ExportButton() {
  const { slides, currentTheme, project } = useSlideStore();

  const handleExportPPTX = async () => {
    try {
      toast.loading('Generating PPTX...');
      
      const exporter = new PPTXExporter(currentTheme, {
        title: project?.title || 'Presentation',
      });
      
      const blob = await exporter.exportSlides(slides);
      
      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.title || 'presentation'}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('PPTX exported successfully!');
    } catch (error) {
      toast.error('Failed to export PPTX');
      console.error(error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExportPPTX}>
          <FileDown className="w-4 h-4 mr-2" />
          Download as PPTX
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileText className="w-4 h-4 mr-2" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Image className="w-4 h-4 mr-2" />
          Download as Images
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 1.3 Content Type Mapping Matrix

| App Content Type | PPTX Equivalent | Method |
|-----------------|-----------------|--------|
| `title` | Text with fontSize 44 | `slide.addText()` |
| `heading1` | Text with fontSize 36 | `slide.addText()` |
| `heading2` | Text with fontSize 28 | `slide.addText()` |
| `paragraph` | Text with fontSize 18 | `slide.addText()` |
| `image` | Image | `slide.addImage()` |
| `bulletedList` | Text with bullet | `slide.addText({ bullet: true })` |
| `numberedList` | Text with numbering | `slide.addText({ bullet: { type: 'number' } })` |
| `table` | Table | `slide.addTable()` |
| `blockquote` | Text with shape | `slide.addShape() + addText()` |
| `code` | Text with monospace | `slide.addText({ fontFace: 'Courier New' })` |
| `calloutBox` | Shape with text | `slide.addShape()` |

---

## Phase 2: PPTX Import & Parsing

### 2.1 PPTX Parser Architecture

PPTX files are ZIP archives containing XML files. The structure:

```
presentation.pptx/
├── [Content_Types].xml
├── _rels/
│   └── .rels
├── ppt/
│   ├── presentation.xml
│   ├── slides/
│   │   ├── slide1.xml
│   │   ├── slide2.xml
│   │   └── ...
│   ├── slideLayouts/
│   ├── slideMasters/
│   └── media/
│       ├── image1.png
│       └── ...
└── docProps/
    ├── core.xml
    └── app.xml
```

### 2.2 Parser Service

**File: `src/lib/pptx/parser.ts`**

```typescript
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import { Slide, ContentItem, Theme } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export interface ParsedPresentation {
  slides: Slide[];
  theme: Partial<Theme>;
  metadata: {
    title?: string;
    author?: string;
    created?: Date;
    modified?: Date;
  };
  media: Map<string, Blob>;
}

export class PPTXParser {
  private zip: JSZip;
  private xmlParser: XMLParser;
  private media: Map<string, Blob>;

  constructor() {
    this.zip = new JSZip();
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      removeNSPrefix: true,
    });
    this.media = new Map();
  }

  async parse(file: File | Blob): Promise<ParsedPresentation> {
    const zipContent = await this.zip.loadAsync(file);
    
    // Extract media files first
    await this.extractMedia(zipContent);
    
    // Parse presentation structure
    const presentationXml = await this.getPresentationXml(zipContent);
    
    // Parse slides
    const slides = await this.parseSlides(zipContent, presentationXml);
    
    // Parse theme
    const theme = await this.parseTheme(zipContent);
    
    // Parse metadata
    const metadata = await this.parseMetadata(zipContent);

    return { slides, theme, metadata, media: this.media };
  }

  private async extractMedia(zip: JSZip): Promise<void> {
    const mediaFolder = zip.folder('ppt/media');
    if (!mediaFolder) return;

    const mediaFiles = Object.keys(zip.files)
      .filter(name => name.startsWith('ppt/media/'));

    for (const path of mediaFiles) {
      const file = zip.files[path];
      if (!file.dir) {
        const blob = await file.async('blob');
        const fileName = path.split('/').pop() || '';
        this.media.set(fileName, blob);
      }
    }
  }

  private async parseSlides(zip: JSZip, presentation: any): Promise<Slide[]> {
    const slides: Slide[] = [];
    const slideOrder = this.getSlideOrder(presentation);

    for (let i = 0; i < slideOrder.length; i++) {
      const slideId = slideOrder[i];
      const slideXml = await this.getSlideXml(zip, i + 1);
      
      if (slideXml) {
        const parsedSlide = this.parseSlideContent(slideXml, i);
        slides.push(parsedSlide);
      }
    }

    return slides;
  }

  private parseSlideContent(slideXml: any, index: number): Slide {
    const spTree = slideXml?.sld?.cSld?.spTree;
    const contentItems: ContentItem[] = [];

    if (spTree?.sp) {
      const shapes = Array.isArray(spTree.sp) ? spTree.sp : [spTree.sp];
      
      for (const shape of shapes) {
        const contentItem = this.parseShape(shape);
        if (contentItem) {
          contentItems.push(contentItem);
        }
      }
    }

    // Parse pictures
    if (spTree?.pic) {
      const pictures = Array.isArray(spTree.pic) ? spTree.pic : [spTree.pic];
      
      for (const pic of pictures) {
        const imageItem = this.parsePicture(pic);
        if (imageItem) {
          contentItems.push(imageItem);
        }
      }
    }

    return {
      id: uuidv4(),
      slideName: `Slide ${index + 1}`,
      type: 'imported',
      slideOrder: index,
      className: 'p-4 md:p-8 mx-auto flex justify-center items-center h-full w-full',
      content: {
        id: uuidv4(),
        type: 'column',
        name: 'Column',
        content: contentItems,
      },
    };
  }

  private parseShape(shape: any): ContentItem | null {
    const txBody = shape?.txBody;
    if (!txBody) return null;

    const paragraphs = txBody?.p;
    if (!paragraphs) return null;

    const pArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    let text = '';
    let isBullet = false;
    let fontSize = 18;

    for (const p of pArray) {
      const runs = p?.r;
      if (runs) {
        const rArray = Array.isArray(runs) ? runs : [runs];
        for (const r of rArray) {
          text += r?.t || '';
          
          // Check font size
          const rPr = r?.rPr;
          if (rPr?.['@_sz']) {
            fontSize = parseInt(rPr['@_sz']) / 100;
          }
        }
      }
      
      // Check for bullets
      if (p?.pPr?.buChar || p?.pPr?.buAutoNum) {
        isBullet = true;
      }
      
      text += '\n';
    }

    text = text.trim();
    if (!text) return null;

    // Determine content type based on fontSize
    let type: ContentItem['type'] = 'paragraph';
    if (fontSize >= 36) type = 'title';
    else if (fontSize >= 28) type = 'heading1';
    else if (fontSize >= 24) type = 'heading2';
    else if (isBullet) type = 'bulletedList';

    return {
      id: uuidv4(),
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      content: isBullet ? text.split('\n').filter(Boolean) : text,
      placeholder: '',
    };
  }

  private parsePicture(pic: any): ContentItem | null {
    const blipFill = pic?.blipFill;
    const blip = blipFill?.blip;
    const embed = blip?.['@_r:embed'];

    if (!embed) return null;

    // The embed ID references the relationship file
    // We'll need to resolve this to get the actual image path
    return {
      id: uuidv4(),
      type: 'image',
      name: 'Image',
      content: '', // Will be resolved later
      alt: 'Imported image',
      // Store the embed ID for later resolution
      className: `embed:${embed}`,
    };
  }

  // ... additional helper methods
}
```

### 2.3 Import UI Component

**File: `src/components/global/ImportPPTX.tsx`**

```typescript
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileUp, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PPTXParser } from '@/lib/pptx/parser';
import { useSlideStore } from '@/store/useSlideStore';
import { toast } from 'sonner';

export function ImportPPTX() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setSlides, setCurrentTheme } = useSlideStore();

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.pptx')) {
      toast.error('Please upload a .pptx file');
      return;
    }

    setIsLoading(true);
    try {
      const parser = new PPTXParser();
      const result = await parser.parse(file);

      setSlides(result.slides);
      if (result.theme) {
        setCurrentTheme({
          name: 'Imported',
          fontFamily: result.theme.fontFamily || "'Inter', sans-serif",
          fontColor: result.theme.fontColor || '#333333',
          backgroundColor: result.theme.backgroundColor || '#ffffff',
          accentColor: result.theme.accentColor || '#3b82f6',
          type: 'light',
        });
      }

      toast.success(`Imported ${result.slides.length} slides!`);
      setIsOpen(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import PPTX file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Import PPTX
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import PowerPoint Presentation</DialogTitle>
        </DialogHeader>
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center
            transition-colors cursor-pointer
            ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          `}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p>Parsing presentation...</p>
            </div>
          ) : (
            <>
              <FileUp className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag and drop your .pptx file here, or click to browse
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 2.4 Media Upload Service

For imported images, create an upload service to handle media files.

**File: `src/lib/pptx/mediaUploader.ts`**

```typescript
export async function uploadMedia(
  media: Map<string, Blob>,
  projectId: string
): Promise<Map<string, string>> {
  const uploadedUrls = new Map<string, string>();

  for (const [filename, blob] of media) {
    const formData = new FormData();
    formData.append('file', blob, filename);
    formData.append('projectId', projectId);

    const response = await fetch('/api/upload-media', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const { url } = await response.json();
      uploadedUrls.set(filename, url);
    }
  }

  return uploadedUrls;
}
```

---

## Phase 3: Advanced Editing Features

### 3.1 PowerPoint-like Features to Implement

| Feature | Priority | Complexity |
|---------|----------|------------|
| Text formatting (bold, italic, underline) | High | Low |
| Font size/family selection | High | Low |
| Color picker for text/shapes | High | Medium |
| Shape insertion | Medium | Medium |
| Animation presets | Low | High |
| Slide transitions | Low | High |
| Speaker notes | Medium | Low |
| Master slides/templates | Medium | High |
| Charts and graphs | Medium | High |
| SmartArt diagrams | Low | Very High |

### 3.2 Enhanced Toolbar Component

**File: `src/components/global/editor/EnhancedToolbar.tsx`**

```typescript
'use client';

import { useSlideStore } from '@/store/useSlideStore';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Image,
  Square,
  Circle,
  Type,
  Palette,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '44', '48', '60', '72'];
const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
];

export function EnhancedToolbar() {
  const { selectedComponentId, updateComponent, slides, currentSlide } = useSlideStore();

  const applyStyle = (updates: Record<string, any>) => {
    if (!selectedComponentId) return;
    const slide = slides[currentSlide];
    updateComponent(slide.id, selectedComponentId, updates);
  };

  return (
    <div className="flex items-center gap-1 p-2 bg-background border-b">
      {/* Font Family */}
      <Select onValueChange={(value) => applyStyle({ fontFamily: value })}>
        <SelectTrigger className="w-[140px] h-8">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size */}
      <Select onValueChange={(value) => applyStyle({ fontSize: `${value}px` })}>
        <SelectTrigger className="w-[80px] h-8">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-px h-6 bg-border mx-2" />

      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => applyStyle({ fontWeight: 'bold' })}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => applyStyle({ fontStyle: 'italic' })}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => applyStyle({ textDecoration: 'underline' })}
      >
        <Underline className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-2" />

      {/* Alignment */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => applyStyle({ textAlign: 'left' })}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => applyStyle({ textAlign: 'center' })}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => applyStyle({ textAlign: 'right' })}
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-2" />

      {/* Color Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <ColorPicker onSelect={(color) => applyStyle({ color })} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

### 3.3 Speaker Notes Feature

**File: `src/lib/types.ts`** (additions)

```typescript
export interface Slide {
  id: string;
  slideName: string;
  type: string;
  content: ContentItem;
  slideOrder?: number;
  className?: string;
  // New fields
  speakerNotes?: string;
  transition?: SlideTransition;
  animation?: SlideAnimation;
}

export interface SlideTransition {
  type: 'none' | 'fade' | 'slide' | 'zoom' | 'wipe';
  duration: number; // milliseconds
  direction?: 'left' | 'right' | 'up' | 'down';
}

export interface SlideAnimation {
  entrance?: AnimationEffect[];
  emphasis?: AnimationEffect[];
  exit?: AnimationEffect[];
}

export interface AnimationEffect {
  targetId: string;
  type: 'fadeIn' | 'slideIn' | 'zoomIn' | 'bounce' | 'pulse';
  delay: number;
  duration: number;
}
```

### 3.4 Speaker Notes Panel

**File: `src/components/global/editor/SpeakerNotesPanel.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useSlideStore } from '@/store/useSlideStore';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SpeakerNotesPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { slides, currentSlide, updateSlide } = useSlideStore();
  
  const currentSlideData = slides[currentSlide];
  const notes = currentSlideData?.speakerNotes || '';

  const handleNotesChange = (value: string) => {
    // Add updateSpeakerNotes to store
    // updateSlide logic here
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-80 right-80 bg-background border-t transition-all duration-300",
      isExpanded ? "h-48" : "h-10"
    )}>
      <div
        className="flex items-center justify-between px-4 h-10 cursor-pointer hover:bg-muted"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4" />
          <span className="text-sm font-medium">Speaker Notes</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </div>
      
      {isExpanded && (
        <Textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Add speaker notes for this slide..."
          className="h-[calc(100%-40px)] resize-none border-0 focus-visible:ring-0"
        />
      )}
    </div>
  );
}
```

---

## Phase 4: Real-time Collaboration

### 4.1 Collaborative Editing Architecture

For future real-time collaboration, consider:

- **Yjs** or **Automerge** for CRDT-based conflict resolution
- **Socket.io** or **Liveblocks** for real-time sync
- **Presence** indicators showing who's editing what

### 4.2 Collaboration Integration Points

```typescript
// Future: src/lib/collaboration/index.ts
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

export function initCollaboration(documentId: string) {
  const ydoc = new Y.Doc();
  const provider = new WebrtcProvider(documentId, ydoc);
  
  // Sync slides as Y.Array
  const ySlides = ydoc.getArray('slides');
  
  return { ydoc, provider, ySlides };
}
```

---

## Database Schema Changes

### 5.1 Updated Prisma Schema

```prisma
// prisma/schema.prisma additions

model Project {
  id          String      @id @default(cuid())
  title       String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  slides      Json?
  userId      String      @db.Uuid
  outlines    String[]
  isDeleted   Boolean     @default(false)
  isSellable  Boolean     @default(false)
  varientId   String?
  thumbnail   String?
  themeName   String      @default("light")
  projectType ProjectType @default(PRESENTATION)

  // New fields for PPTX support
  sourceFormat  String?   @default("native") // "native" | "pptx" | "pdf"
  originalFile  String?   // URL to original uploaded file
  exportHistory ExportHistory[]
  speakerNotes  Json?     // { slideId: string, notes: string }[]
  
  User       User   @relation("OwnedProjects", fields: [userId], references: [id])
  Purchasers User[] @relation("PurchasedProjects")
}

model ExportHistory {
  id        String   @id @default(cuid())
  projectId String
  format    String   // "pptx" | "pdf" | "png"
  exportedAt DateTime @default(now())
  fileUrl   String?
  fileSize  Int?
  
  Project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model MediaAsset {
  id        String   @id @default(cuid())
  projectId String
  filename  String
  url       String
  mimeType  String
  size      Int
  createdAt DateTime @default(now())
  
  @@index([projectId])
}
```

---

## File Structure

### Complete New Files to Create

```
src/
├── lib/
│   └── pptx/
│       ├── index.ts              # Main exports
│       ├── exporter.ts           # PPTX export logic
│       ├── parser.ts             # PPTX import/parsing
│       ├── mediaUploader.ts      # Handle media files
│       ├── contentMapper.ts      # Map between formats
│       ├── themeExtractor.ts     # Extract theme from PPTX
│       └── types.ts              # PPTX-specific types
├── components/
│   └── global/
│       ├── ExportButton.tsx
│       ├── ImportPPTX.tsx
│       └── editor/
│           ├── EnhancedToolbar.tsx
│           ├── SpeakerNotesPanel.tsx
│           ├── ColorPicker.tsx
│           ├── ShapeInserter.tsx
│           └── TransitionPicker.tsx
├── app/
│   └── api/
│       ├── export-pptx/
│       │   └── route.ts          # Server-side export
│       ├── import-pptx/
│       │   └── route.ts          # Server-side import
│       └── upload-media/
│           └── route.ts          # Media upload endpoint
└── actions/
    └── pptx.ts                   # Server actions for PPTX
```

---

## Implementation Timeline

### Phase 1: Basic Export (Week 1-2)

- [ ] Create `PPTXExporter` class
- [ ] Implement text content export
- [ ] Implement image export
- [ ] Implement table export
- [ ] Add Export button to Navbar
- [ ] Test with various slide layouts

### Phase 2: Basic Import (Week 3-4)

- [ ] Create `PPTXParser` class
- [ ] Implement slide structure parsing
- [ ] Implement text extraction
- [ ] Implement image extraction
- [ ] Implement media upload service
- [ ] Add Import dialog component
- [ ] Test with various PPTX files

### Phase 3: Advanced Export (Week 5-6)

- [ ] Add theme export
- [ ] Add shape export
- [ ] Add list formatting
- [ ] Add code block styling
- [ ] Add callout boxes
- [ ] Server-side export for large files

### Phase 4: Advanced Import (Week 7-8)

- [ ] Parse complex layouts
- [ ] Extract embedded charts
- [ ] Parse SmartArt (simplified)
- [ ] Extract animations (metadata only)
- [ ] Theme extraction and application

### Phase 5: Enhanced Editing (Week 9-10)

- [ ] Enhanced toolbar implementation
- [ ] Color picker integration
- [ ] Font family/size controls
- [ ] Shape insertion
- [ ] Speaker notes panel

### Phase 6: Polish & Testing (Week 11-12)

- [ ] Comprehensive testing
- [ ] Edge case handling
- [ ] Performance optimization
- [ ] Documentation
- [ ] User feedback integration

---

## API Endpoints

### Export Endpoint

**`POST /api/export-pptx`**

```typescript
// src/app/api/export-pptx/route.ts
import { NextResponse } from 'next/server';
import { PPTXExporter } from '@/lib/pptx/exporter';
import { getProjectById } from '@/actions/projects';

export async function POST(request: Request) {
  try {
    const { projectId } = await request.json();
    
    const project = await getProjectById(projectId);
    if (!project.data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const theme = {/* extract theme */};
    const exporter = new PPTXExporter(theme, {
      title: project.data.title,
    });

    const slides = JSON.parse(JSON.stringify(project.data.slides));
    const blob = await exporter.exportSlides(slides);

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${project.data.title}.pptx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
```

### Import Endpoint

**`POST /api/import-pptx`**

```typescript
// src/app/api/import-pptx/route.ts
import { NextResponse } from 'next/server';
import { PPTXParser } from '@/lib/pptx/parser';
import { uploadMedia } from '@/lib/pptx/mediaUploader';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const parser = new PPTXParser();
    const result = await parser.parse(file);

    // Upload media to storage
    const mediaUrls = await uploadMedia(result.media, 'temp-project');

    // Resolve media URLs in slides
    const slidesWithMedia = resolveMediaUrls(result.slides, mediaUrls);

    return NextResponse.json({
      slides: slidesWithMedia,
      theme: result.theme,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
```

---

## Component Architecture

### Updated Component Tree

```
App
├── Navbar
│   ├── ExportButton (NEW)
│   ├── ImportPPTX (NEW)
│   └── ...existing
├── Editor
│   ├── EnhancedToolbar (NEW)
│   ├── SlideCanvas
│   │   └── MasterRecursiveComponent
│   └── SpeakerNotesPanel (NEW)
├── LeftSidebar
│   └── ...existing
└── RightSidebar
    ├── ...existing
    └── TransitionPicker (NEW)
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/pptx/exporter.test.ts
describe('PPTXExporter', () => {
  it('should export title slide correctly', async () => {
    const exporter = new PPTXExporter(defaultTheme);
    const blob = await exporter.exportSlides([titleSlide]);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should handle images correctly', async () => {
    // Test image export
  });

  it('should apply theme colors', async () => {
    // Test theme application
  });
});
```

### Integration Tests

```typescript
// __tests__/pptx/integration.test.ts
describe('PPTX Round-trip', () => {
  it('should export and re-import without data loss', async () => {
    const originalSlides = [...];
    
    const exporter = new PPTXExporter(theme);
    const blob = await exporter.exportSlides(originalSlides);
    
    const parser = new PPTXParser();
    const imported = await parser.parse(blob);
    
    // Compare structure
    expect(imported.slides.length).toBe(originalSlides.length);
  });
});
```

---

## Performance Considerations

1. **Large Files**: Use streaming for files > 10MB
2. **Image Compression**: Compress images before embedding
3. **Web Workers**: Offload parsing to Web Workers
4. **Lazy Loading**: Parse slides on-demand for large presentations
5. **Caching**: Cache parsed PPTX structure

---

## Security Considerations

1. **File Validation**: Validate PPTX structure before parsing
2. **Size Limits**: Enforce maximum file size (e.g., 50MB)
3. **Sanitization**: Sanitize text content from imported files
4. **Media Scanning**: Scan uploaded media for malware
5. **Rate Limiting**: Limit export/import requests

---

## Next Steps

1. **Install dependencies**:
   ```bash
   bun add xml2js @types/xml2js fast-xml-parser file-saver @types/file-saver
   ```

2. **Create the file structure** as outlined above

3. **Start with Phase 1** - Basic Export functionality

4. **Test incrementally** with simple presentations first

5. **Gather user feedback** and iterate

---

## References

- [PptxGenJS Documentation](https://gitbrent.github.io/PptxGenJS/)
- [Office Open XML Format](https://docs.microsoft.com/en-us/openspecs/office_standards/ms-pptx/)
- [OOXML Structure](https://wiki.openoffice.org/wiki/OOXML)
