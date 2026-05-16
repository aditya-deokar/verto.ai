export interface Technology {
  name: string;
  category: string;
  description?: string;
}

export interface TechStats {
  totalTechnologies: string;
  typescriptCoverage: string;
  microservices?: string;
  aiModels?: string;
}

export interface OverviewKeyPoint {
  number: string;
  title: string;
  description: string;
}

export interface OverviewQuote {
  text: string;
  label: string;
}

export interface FeatureImpact {
  metric: string;
  label: string;
}

export interface Feature {
  number: string;
  title: string;
  description: string;
  tags: string[];
  impact: FeatureImpact[];
}

export interface ProcessPhase {
  phase: string;
  title: string;
  subtitle: string;
  description: string;
  keywords: string[];
}

export interface ProcessStats {
  phases: string;
  technologies: string;
  ciTimeReduction?: string;
  uptime?: string;
  dropOffReduction?: string;
  dauIncrease?: string;
  designIterations?: string;
  aiWorkflows?: string;
  nodeTypes?: string;
}

export interface Outcome {
  metric: string;
  label: string;
}

export interface ContactInfo {
  label: string;
  value: string;
  url: string | null;
  hasIndicator?: boolean;
}

export interface FooterCta {
  heading: {
    text: string;
    highlight: string;
    suffix: string;
  };
  primaryButton: {
    text: string;
    url: string;
  };
  secondaryButton: {
    text: string;
    url: string;
  };
  contactInfo: ContactInfo[];
}

export interface SocialLink {
  name: string;
  url: string;
}

export interface Footer {
  description: string;
  social: SocialLink[];
  quickLinks: string[];
  projects: string[];
  resources: string[];
  legal: string[];
  copyright: string;
  rightsReserved: string;
}

export interface SelectedPoint {
  number: string;
  title: string;
  description: string;
  summary?: string;
}

export interface DetailedProject {
  name: string;
  tagline: string;
  year: string;
  role: string;
  duration: string;
  team: string;
  category: string;
  navigation: string[];
  overviewDescription: string;
  overviewKeyPoints: OverviewKeyPoint[];
  overviewQuote: OverviewQuote;
  technologies: {
    frontend: Technology[];
    backend: Technology[];
    ai?: Technology[];
    devops?: Technology[];
  };
  techStats: TechStats;
  overview: string;
  features: Feature[];
  process: ProcessPhase[];
  processStats: ProcessStats;
  outcomes: Outcome[];
  videos?: string[];
  footerCta: FooterCta;
  footer: Footer;
}

export type ProjectData = DetailedProject;
export type FooterCtaData = FooterCta;
export type FooterData = Footer;

const docsBaseUrl = "https://github.com/aditya-deokar/verto-ai/blob/master/docs";

export const vertoAiDetailedProjectData: DetailedProject = {
  name: "Verto AI",
  tagline: "Layout-first, multi-agent presentation generation with production-grade full-stack architecture",
  year: "2026",
  role: "Founder Engineer / Full-Stack + AI Systems",
  duration: "Ongoing product development",
  team: "Solo engineering with production SaaS scope",
  category: "AI SaaS, Developer Platform, Productivity",
  navigation: ["Overview", "Architecture", "Features", "Process", "Outcomes", "Docs"],
  overviewDescription:
    "Verto AI is a Next.js 16 and React 19 SaaS platform that converts user prompts into complete slide decks using an 8-agent LangGraph pipeline. The system combines secure server actions, structured LLM validation, deterministic layout selection, image retrieval, and JSON compilation into an editor-ready presentation format.",
  overviewKeyPoints: [
    {
      number: "8",
      title: "Specialized AI agents",
      description:
        "The generation graph runs 8 distinct agents from project initialization through database persistence, each with clear responsibilities and state transitions.",
    },
    {
      number: "9",
      title: "Project CRUD server actions",
      description:
        "Core project lifecycle operations are implemented with ownership checks and soft-delete behavior to reduce accidental data loss.",
    },
    {
      number: "6",
      title: "Zustand stores",
      description:
        "State is segmented by workflow responsibility, with persistence for editing contexts and ephemeral stores for runtime interaction.",
    },
    {
      number: "10",
      title: "Architecture docs",
      description:
        "Documentation covers architecture, tech stack, data model, API behavior, frontend structure, security, deployment, and testing strategy.",
    },
  ],
  overviewQuote: {
    text: "The key systems decision was layout-first generation: choose visual structure before writing content, then compile deterministic slide JSON for a recursive editor runtime.",
    label: "Architecture Decision - Agentic Workflow V2",
  },
  technologies: {
    frontend: [
      {
        name: "Next.js 16",
        category: "Framework",
        description: "App Router, Server Actions, Turbopack, and React Compiler enabled.",
      },
      {
        name: "React 19",
        category: "UI Runtime",
        description: "Component-driven editor, present mode, and landing experiences.",
      },
      {
        name: "TypeScript 5",
        category: "Language",
        description: "Strict mode and typed contracts across UI, actions, and AI state.",
      },
      {
        name: "Zustand",
        category: "State Management",
        description: "Store partitioning with persistence and undo/redo support.",
      },
      {
        name: "Tailwind CSS v4 + Radix UI",
        category: "Design System",
        description: "Utility styling plus accessible primitives and shadcn composition.",
      },
    ],
    backend: [
      {
        name: "Prisma + PostgreSQL",
        category: "Data Layer",
        description: "JSON slide storage, relational models, and migration-driven schema evolution.",
      },
      {
        name: "Clerk",
        category: "Authentication",
        description: "Edge middleware protection and server-side identity verification.",
      },
      {
        name: "Lemon Squeezy",
        category: "Payments",
        description: "Webhook-driven subscription state sync with merchant-of-record model.",
      },
      {
        name: "Inngest",
        category: "Background Jobs",
        description: "Asynchronous generation flows for mobile design subsystem tasks.",
      },
    ],
    ai: [
      {
        name: "Google Gemini 2.5 Flash",
        category: "LLM",
        description: "Primary model with per-agent temperature and token profile tuning.",
      },
      {
        name: "LangGraph",
        category: "Orchestration",
        description: "State machine orchestration with sequential and conditional agent edges.",
      },
      {
        name: "LangChain + AI SDK",
        category: "Model Integration",
        description: "Structured generation, schema validation, and provider abstraction.",
      },
      {
        name: "Unsplash API",
        category: "Image Retrieval",
        description: "Slide image search with fallback provider for resiliency.",
      },
    ],
    devops: [
      {
        name: "Vercel-ready Next.js deployment",
        category: "Hosting",
        description: "Production deployment model aligned with App Router conventions.",
      },
      {
        name: "SSE streaming",
        category: "Observability",
        description: "Real-time generation event feedback to the client.",
      },
      {
        name: "Zod runtime validation",
        category: "Reliability",
        description: "LLM response contracts validated at every major pipeline stage.",
      },
    ],
  },
  techStats: {
    totalTechnologies: "30+ documented libraries/services across platform layers",
    typescriptCoverage: "Strict TypeScript mode across application, agents, and server actions",
    microservices: "Event-driven subsystem split (presentation flow + Inngest mobile workflows)",
    aiModels: "Gemini 2.5 Flash with 5 tuned agent profiles and schema-validated outputs",
  },
  overview:
    "The platform is engineered as a system, not just a UI. It combines secure ownership-checked data operations, a typed AI state machine, and a recursive rendering architecture to provide both fast generation and deep editability. The technical design balances speed (Turbopack + layout-aware generation), quality control (Zod + deterministic JSON compilation), and production concerns (auth boundaries, webhook handling, documented deployment and testing checklists).",
  features: [
    {
      number: "01",
      title: "8-Agent LangGraph Presentation Pipeline",
      description:
        "A stateful agent graph drives generation from initialization to persistence. Each node has explicit progress semantics and contributes typed state updates.",
      tags: ["LangGraph", "State Machine", "AI Orchestration", "Generation Run Tracking"],
      impact: [
        { metric: "8", label: "Sequential specialized agent stages" },
        { metric: "150", label: "Recursion limit configured for loop-safe image fetching" },
      ],
    },
    {
      number: "02",
      title: "Layout-First Generation for Higher Output Fidelity",
      description:
        "Layout selection occurs before content writing, so content is generated with structural awareness. This avoids post-hoc formatting and improves visual coherence.",
      tags: ["Layout Intelligence", "Content Structuring", "JSON Compiler", "Rendering Consistency"],
      impact: [
        { metric: "17+", label: "Supported layout families and templates" },
        { metric: "1", label: "Largest agent dedicated to deterministic JSON compilation" },
      ],
    },
    {
      number: "03",
      title: "Secure-By-Default Server Action Layer",
      description:
        "A centralized ownership helper and default-deny middleware enforce access control across project operations and shared routes.",
      tags: ["Clerk", "Authorization", "Server Actions", "Security"],
      impact: [
        { metric: "9", label: "Documented project CRUD actions with ownership enforcement" },
        { metric: "404", label: "Not-found masking prevents resource enumeration for non-owners" },
      ],
    },
    {
      number: "04",
      title: "Real-Time Generation Visibility",
      description:
        "Progress tracking is persisted in database runs and streamed to clients through SSE events for transparent pipeline execution.",
      tags: ["SSE", "Progress Tracking", "Run Telemetry", "UX Feedback"],
      impact: [
        { metric: "7", label: "Generation run tracking actions documented" },
        { metric: "100%", label: "Agent phases represented in run-step status snapshots" },
      ],
    },
    {
      number: "05",
      title: "Production-Ready Documentation and Engineering Traceability",
      description:
        "Architecture, stack, data model, API, security, and testing are documented with diagrams and operational guidance, enabling faster onboarding and safer changes.",
      tags: ["Architecture Docs", "Engineering Governance", "Onboarding", "Maintainability"],
      impact: [
        { metric: "10", label: "Core technical documentation artifacts" },
        { metric: "13", label: "Manual critical-path smoke tests enumerated" },
      ],
    },
  ],
  process: [
    {
      phase: "Phase 01",
      title: "Foundation and Architecture Decisions",
      subtitle: "Framework, domain boundaries, and orchestration strategy",
      description:
        "Established Next.js App Router architecture, selected LangGraph for stateful agent orchestration, and formalized key ADRs around auth, state management, and recursive rendering.",
      keywords: ["Next.js 16", "ADR", "LangGraph", "System Design", "Boundary Definition"],
    },
    {
      phase: "Phase 02",
      title: "Data and Access Control Layer",
      subtitle: "Relational models plus ownership-first backend actions",
      description:
        "Implemented Prisma/PostgreSQL models for projects, runs, subscriptions, and mobile design. Added centralized ownership checks and soft-delete lifecycle semantics.",
      keywords: ["Prisma", "PostgreSQL", "Clerk", "Authorization", "Server Actions"],
    },
    {
      phase: "Phase 03",
      title: "Agentic Generation Pipeline",
      subtitle: "8-stage AI flow from prompt to persisted slide JSON",
      description:
        "Built a layout-aware pipeline with tuned model profiles, image provider abstraction, Zod validation, conditional image loops, and deterministic JSON compilation.",
      keywords: ["Gemini 2.5 Flash", "Zod", "Layout-first", "Image Providers", "JSON Compiler"],
    },
    {
      phase: "Phase 04",
      title: "Product UX, Reliability, and Operational Hardening",
      subtitle: "Editor behavior, sharing, billing, and testing protocol",
      description:
        "Integrated editor workflows, public share controls, Lemon Squeezy billing sync, SSE progress visibility, and structured manual smoke testing across critical paths.",
      keywords: ["Editor UX", "Sharing", "Webhooks", "SSE", "Testing Strategy"],
    },
  ],
  processStats: {
    phases: "4",
    technologies: "30+",
    aiWorkflows: "8-agent LangGraph workflow with conditional image-fetch loop",
    nodeTypes: "Sequential nodes plus conditional edges in state graph",
  },
  outcomes: [
    { metric: "8/8", label: "AI pipeline stages documented and implemented" },
    { metric: "9", label: "Project CRUD server actions standardized" },
    { metric: "6", label: "Frontend/client state stores separated by concern" },
    { metric: "10", label: "Core engineering documentation modules available" },
    { metric: "13", label: "Manual critical-path smoke tests defined" },
  ],
  footerCta: {
    heading: {
      text: "Want to review the",
      highlight: "system design and implementation",
      suffix: "in depth?",
    },
    primaryButton: {
      text: "Read Full Documentation",
      url: "https://github.com/aditya-deokar/verto-ai/tree/master/docs",
    },
    secondaryButton: {
      text: "View Source Repository",
      url: "https://github.com/aditya-deokar/verto-ai",
    },
    contactInfo: [
      {
        label: "Architecture",
        value: "High-level system architecture and flows",
        url: `${docsBaseUrl}/01-architecture-overview.md`,
        hasIndicator: true,
      },
      {
        label: "Agentic Workflow",
        value: "8-agent pipeline deep dive",
        url: `${docsBaseUrl}/03-agentic-workflow.md`,
        hasIndicator: true,
      },
      {
        label: "API Reference",
        value: "Server action and endpoint behavior",
        url: `${docsBaseUrl}/05-api-reference.md`,
        hasIndicator: true,
      },
      {
        label: "Security",
        value: "Authn/Authz and data protection model",
        url: `${docsBaseUrl}/09-security.md`,
        hasIndicator: true,
      },
    ],
  },
  footer: {
    description:
      "Verto AI is a production-focused AI presentation system with architecture choices documented for maintainability, security, and quality at scale.",
    social: [
      {
        name: "GitHub",
        url: "https://github.com/aditya-deokar/verto-ai",
      },
      {
        name: "Documentation",
        url: "https://github.com/aditya-deokar/verto-ai/tree/master/docs",
      },
    ],
    quickLinks: ["Overview", "Architecture", "Features", "Process", "Outcomes", "Docs"],
    projects: ["Verto AI", "Agentic Workflow V2", "Mobile Design Generator"],
    resources: [
      `${docsBaseUrl}/01-architecture-overview.md`,
      `${docsBaseUrl}/02-technology-stack.md`,
      `${docsBaseUrl}/03-agentic-workflow.md`,
      `${docsBaseUrl}/04-data-model.md`,
      `${docsBaseUrl}/05-api-reference.md`,
      `${docsBaseUrl}/06-frontend-architecture.md`,
      `${docsBaseUrl}/09-security.md`,
      `${docsBaseUrl}/10-testing-strategy.md`,
    ],
    legal: ["Privacy", "Terms", "Licensing"],
    copyright: "2026 Aditya Deokar",
    rightsReserved: "All rights reserved.",
  },
};

export default vertoAiDetailedProjectData;