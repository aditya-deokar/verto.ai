# Screen-by-Screen Walkthrough Guide: Verto AI

This guide provides a detailed walkthrough of each screen in Verto AI, highlighting the best features and technical implementation details for your video.

---

## 1. The Landing Page
**Highlight**: Modern "Awwwards-grade" Aesthetic
- **What to show**: Scroll down the page to reveal the GSAP-driven entrance animations.
- **Key Feature**: Editorial typography (Inter/Outfit mix) and glassmorphic UI elements.
- **Technical Insight**: Mention the use of `@gsap/react` for smooth, scroll-triggered reveals and the custom `Preloader` component that builds anticipation.

## 2. The Dashboard
**Highlight**: Responsive Project Management
- **What to show**: The grid of existing presentations with their thumbnails and metadata.
- **Key Feature**: Real-time project status and "Last edited" relative timestamps.
- **Technical Insight**: Discuss the **Server Action** CRUD pattern. Every delete or rename operation is optimistically updated in the **Zustand store** before being persisted via Prisma, ensuring zero-latency feel for the user.

## 3. The Creation Flow (The "Runway")
**Highlight**: Real-time Agentic Progress Tracking
- **What to show**: Enter a topic (e.g., "The Future of Quantum Computing") and click "Generate".
- **Key Feature**: The live progress tracker showing each of the 8 agents (Architect, Content, Layout, etc.) as they complete their tasks.
- **Technical Insight**: Explain the **SSE (Server-Sent Events)** integration. The server streams `agent_start` and `agent_complete` events directly to the client, while the state is mirrored in the `PresentationGenerationRun` database table for multi-device persistence.

## 4. The Visual Editor
**Highlight**: Recursive Layout-Aware Editing
- **What to show**: Clicking into a slide and dragging a text block or changing an image.
- **Key Feature**: The ability to swap layouts instantly without losing content.
- **Technical Insight**: This is the **Recursive Component Tree** in action. Each slide is a nested JSON structure rendered by `MasterRecursiveComponent.tsx`. Highlight the drag-and-drop capability and the "Layout-First" AI logic that ensures content always fits the chosen container.

## 5. Theme & Design System
**Highlight**: Global Design Injection
- **What to show**: Opening the "Themes" panel and switching from "Minimal" to "Cyberpunk" or "Professional".
- **Key Feature**: Instant global update of fonts, colors, and border-radii across all slides.
- **Technical Insight**: Show how themes are implemented using **Global CSS Variables** and React context. The AI generates content that is "theme-agnostic," allowing the design system to handle the visual skinning separately.

## 6. Mobile Design Subsystem (Bonus)
**Highlight**: Event-Driven Background Generation
- **What to show**: The separate "Mobile Design" dashboard where UI screens are generated.
- **Key Feature**: Complex, high-fidelity HTML/CSS frames generated from a single description.
- **Technical Insight**: Highlight the use of **Inngest**. Because generating full HTML screens is computationally expensive and slow, we offload this to background workers, allowing the user to continue working while the "Mobile Architect" agent builds their screens in the cloud.

---
## Final Tip for the Video
*Start with the "Wow" (the final presentation) and then go back to the "How" (the generation flow and editor).*
