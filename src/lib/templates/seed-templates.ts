// src/lib/templates/seed-templates.ts
// Pre-built presentation template blueprints for the templates gallery

import type { Slide, ContentItem } from "@/lib/types";

export interface SeedTemplate {
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: string;
  slideCount: number;
  themeName: string;
  layoutSequence: string[];
  outlines: string[];
  isPremium: boolean;
  isFeatured: boolean;
  slides: Slide[];
}

// ─── Helper to generate slide IDs ───
let _counter = 0;
const uid = (prefix: string) => `${prefix}-${++_counter}`;

// ═══════════════════════════════════════════════════════════
// 1. YC-STYLE PITCH DECK (Startup & Pitch)
// ═══════════════════════════════════════════════════════════
const ycPitchDeck: SeedTemplate = {
  name: "YC-Style Pitch Deck",
  description:
    "A clean, persuasive pitch deck modeled after YC Demo Day presentations. Perfect for seed rounds, accelerator applications, and investor meetings.",
  category: "STARTUP_PITCH",
  tags: ["startup", "pitch", "fundraising", "investor", "yc", "demo-day"],
  difficulty: "BEGINNER",
  slideCount: 10,
  themeName: "Midnight Navy",
  layoutSequence: [
    "creativeHero",
    "titleAndContent",
    "bigNumberLayout",
    "accentLeft",
    "comparisonLayout",
    "processFlow",
    "statsRow",
    "iconGrid",
    "quoteLayout",
    "callToAction",
  ],
  outlines: [
    "Title & Vision",
    "The Problem",
    "Market Size",
    "Our Solution",
    "Why Us vs Competition",
    "Business Model",
    "Traction & Metrics",
    "Product Features",
    "Customer Testimonial",
    "The Ask & Next Steps",
  ],
  isFeatured: true,
  isPremium: false,
  slides: buildPitchDeckSlides(),
};

function buildPitchDeckSlides(): Slide[] {
  return [
    {
      id: uid("yc"), slideName: "Title & Vision", type: "creativeHero", slideOrder: 0,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("Company Name", "{{company_name}}"),
        para("tagline", "{{tagline}}"),
        img("hero-img", "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800"),
      ]),
    },
    {
      id: uid("yc"), slideName: "The Problem", type: "titleAndContent", slideOrder: 1,
      className: "p-8 mx-auto flex flex-col min-h-[400px]",
      content: col("root", [
        h1("problem-title", "The Problem"),
        para("problem-desc", "{{problem_description}}"),
        bulletList("problem-bullets", [
          "{{pain_point_1}}",
          "{{pain_point_2}}",
          "{{pain_point_3}}",
        ]),
      ]),
    },
    {
      id: uid("yc"), slideName: "Market Size", type: "bigNumberLayout", slideOrder: 2,
      className: "p-8 mx-auto flex min-h-[400px]",
      content: col("root", [
        h1("market-title", "Market Opportunity"),
        statBox("tam", "{{tam_value}}", "Total Addressable Market"),
        para("market-desc", "{{market_description}}"),
      ]),
    },
    {
      id: uid("yc"), slideName: "Our Solution", type: "accentLeft", slideOrder: 3,
      className: "min-h-[300px]",
      content: col("root", [
        h1("solution-title", "Our Solution"),
        para("solution-desc", "{{solution_description}}"),
        img("solution-img", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"),
      ]),
    },
    {
      id: uid("yc"), slideName: "Why Us vs Competition", type: "comparisonLayout", slideOrder: 4,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("comp-title", "Why Us vs Competitors"),
        para("comp-desc", "{{competitive_advantage}}"),
      ]),
    },
    {
      id: uid("yc"), slideName: "Business Model", type: "processFlow", slideOrder: 5,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("biz-title", "Business Model"),
        para("biz-desc", "{{business_model_description}}"),
      ]),
    },
    {
      id: uid("yc"), slideName: "Traction & Metrics", type: "statsRow", slideOrder: 6,
      className: "h-full w-full p-8 flex flex-col justify-center",
      content: col("root", [
        h1("traction-title", "Traction & Metrics"),
        statBox("metric1", "{{metric_1_value}}", "{{metric_1_label}}"),
        statBox("metric2", "{{metric_2_value}}", "{{metric_2_label}}"),
        statBox("metric3", "{{metric_3_value}}", "{{metric_3_label}}"),
      ]),
    },
    {
      id: uid("yc"), slideName: "Product Features", type: "iconGrid", slideOrder: 7,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("features-title", "Key Features"),
        para("features-desc", "{{features_overview}}"),
      ]),
    },
    {
      id: uid("yc"), slideName: "Customer Testimonial", type: "quoteLayout", slideOrder: 8,
      className: "p-12 mx-auto flex items-center justify-center min-h-[400px]",
      content: col("root", [
        blockquote("quote", "{{customer_quote}}"),
        para("attribution", "— {{customer_name}}, {{customer_title}}"),
      ]),
    },
    {
      id: uid("yc"), slideName: "The Ask & Next Steps", type: "callToAction", slideOrder: 9,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("ask-title", "Let's Build Together"),
        para("ask-desc", "{{funding_ask}}"),
        btn("cta-btn", "{{cta_text}}"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// 2. QUARTERLY BUSINESS REVIEW (Business & Corporate)
// ═══════════════════════════════════════════════════════════
const quarterlyReview: SeedTemplate = {
  name: "Quarterly Business Review",
  description:
    "A professional QBR template for presenting quarterly results, KPIs, and strategic plans to stakeholders and leadership teams.",
  category: "BUSINESS",
  tags: ["quarterly", "review", "business", "kpi", "corporate", "results"],
  difficulty: "INTERMEDIATE",
  slideCount: 8,
  themeName: "Royal Sapphire",
  layoutSequence: [
    "creativeHero",
    "statsRow",
    "twoColumnsWithHeadings",
    "bigNumberLayout",
    "accentRight",
    "timelineLayout",
    "iconGrid",
    "callToAction",
  ],
  outlines: [
    "Q4 Overview",
    "Key Metrics",
    "Wins & Challenges",
    "Revenue Growth",
    "Customer Success Story",
    "Roadmap & Milestones",
    "Team Initiatives",
    "Next Quarter Goals",
  ],
  isFeatured: true,
  isPremium: false,
  slides: buildQBRSlides(),
};

function buildQBRSlides(): Slide[] {
  return [
    {
      id: uid("qbr"), slideName: "Q4 Overview", type: "creativeHero", slideOrder: 0,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "{{quarter}} Business Review"),
        para("subtitle", "{{company_name}} • {{date_range}}"),
        img("hero", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"),
      ]),
    },
    {
      id: uid("qbr"), slideName: "Key Metrics", type: "statsRow", slideOrder: 1,
      className: "h-full w-full p-8 flex flex-col justify-center",
      content: col("root", [
        h1("metrics-title", "Key Performance Indicators"),
        statBox("rev", "{{revenue}}", "Revenue"),
        statBox("growth", "{{growth_rate}}", "Growth Rate"),
        statBox("customers", "{{active_customers}}", "Active Customers"),
      ]),
    },
    {
      id: uid("qbr"), slideName: "Wins & Challenges", type: "twoColumnsWithHeadings", slideOrder: 2,
      className: "p-4 mx-auto flex justify-center items-center",
      content: col("root", [
        h1("wc-title", "Wins & Challenges"),
        para("wins", "{{wins_summary}}"),
        para("challenges", "{{challenges_summary}}"),
      ]),
    },
    {
      id: uid("qbr"), slideName: "Revenue Growth", type: "bigNumberLayout", slideOrder: 3,
      className: "p-8 mx-auto flex min-h-[400px]",
      content: col("root", [
        h1("rev-title", "Revenue Growth"),
        statBox("rev-num", "{{revenue_growth}}", "Year-over-Year"),
        para("rev-desc", "{{revenue_context}}"),
      ]),
    },
    {
      id: uid("qbr"), slideName: "Customer Success", type: "accentRight", slideOrder: 4,
      className: "min-h-[300px]",
      content: col("root", [
        h1("cs-title", "Customer Spotlight"),
        para("cs-desc", "{{success_story}}"),
        img("cs-img", "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800"),
      ]),
    },
    {
      id: uid("qbr"), slideName: "Roadmap", type: "timelineLayout", slideOrder: 5,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("roadmap-title", "Roadmap & Milestones"),
        para("roadmap-desc", "{{roadmap_overview}}"),
      ]),
    },
    {
      id: uid("qbr"), slideName: "Team Initiatives", type: "iconGrid", slideOrder: 6,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("team-title", "Team Initiatives"),
        para("team-desc", "{{team_initiatives_overview}}"),
      ]),
    },
    {
      id: uid("qbr"), slideName: "Next Quarter Goals", type: "callToAction", slideOrder: 7,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("goals-title", "Next Quarter: Our Focus"),
        para("goals-desc", "{{next_quarter_priorities}}"),
        btn("goals-cta", "View Full Plan"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// 3. COURSE OVERVIEW (Education)
// ═══════════════════════════════════════════════════════════
const courseOverview: SeedTemplate = {
  name: "Course Overview",
  description:
    "A structured course introduction template ideal for teachers, professors, and online course creators to present syllabus, objectives, and grading criteria.",
  category: "EDUCATION",
  tags: ["education", "course", "syllabus", "teaching", "academic", "lecture"],
  difficulty: "BEGINNER",
  slideCount: 8,
  themeName: "Nature Fresh",
  layoutSequence: [
    "creativeHero",
    "titleAndContent",
    "iconGrid",
    "processFlow",
    "twoColumnsWithHeadings",
    "accentLeft",
    "timelineLayout",
    "callToAction",
  ],
  outlines: [
    "Course Title & Instructor",
    "Learning Objectives",
    "Key Topics",
    "Course Structure",
    "Assessment & Grading",
    "Required Materials",
    "Weekly Schedule",
    "Getting Started",
  ],
  isFeatured: true,
  isPremium: false,
  slides: buildCourseSlides(),
};

function buildCourseSlides(): Slide[] {
  return [
    {
      id: uid("edu"), slideName: "Course Title", type: "creativeHero", slideOrder: 0,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "{{course_title}}"),
        para("instructor", "{{instructor_name}} • {{semester}}"),
        img("hero", "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800"),
      ]),
    },
    {
      id: uid("edu"), slideName: "Learning Objectives", type: "titleAndContent", slideOrder: 1,
      className: "p-8 mx-auto flex flex-col min-h-[400px]",
      content: col("root", [
        h1("obj-title", "Learning Objectives"),
        bulletList("objectives", [
          "{{objective_1}}",
          "{{objective_2}}",
          "{{objective_3}}",
          "{{objective_4}}",
        ]),
      ]),
    },
    {
      id: uid("edu"), slideName: "Key Topics", type: "iconGrid", slideOrder: 2,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("topics-title", "Key Topics We'll Cover"),
        para("topics-desc", "{{topics_overview}}"),
      ]),
    },
    {
      id: uid("edu"), slideName: "Course Structure", type: "processFlow", slideOrder: 3,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("structure-title", "Course Structure"),
        para("structure-desc", "{{course_structure}}"),
      ]),
    },
    {
      id: uid("edu"), slideName: "Assessment", type: "twoColumnsWithHeadings", slideOrder: 4,
      className: "p-4 mx-auto flex justify-center items-center",
      content: col("root", [
        h1("assess-title", "Assessment & Grading"),
        para("assess-desc", "{{grading_policy}}"),
      ]),
    },
    {
      id: uid("edu"), slideName: "Materials", type: "accentLeft", slideOrder: 5,
      className: "min-h-[300px]",
      content: col("root", [
        h1("mat-title", "Required Materials"),
        bulletList("materials", ["{{material_1}}", "{{material_2}}", "{{material_3}}"]),
        img("mat-img", "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800"),
      ]),
    },
    {
      id: uid("edu"), slideName: "Schedule", type: "timelineLayout", slideOrder: 6,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("sched-title", "Weekly Schedule"),
        para("sched-desc", "{{schedule_overview}}"),
      ]),
    },
    {
      id: uid("edu"), slideName: "Getting Started", type: "callToAction", slideOrder: 7,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("start-title", "Let's Get Started!"),
        para("start-desc", "{{getting_started_info}}"),
        btn("start-cta", "View Syllabus"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// 4. PRODUCT LAUNCH (Marketing)
// ═══════════════════════════════════════════════════════════
const productLaunch: SeedTemplate = {
  name: "Product Launch",
  description:
    "A high-impact marketing template for announcing new products, features, or services. Built for maximum visual engagement.",
  category: "MARKETING",
  tags: ["product", "launch", "marketing", "announcement", "go-to-market", "features"],
  difficulty: "BEGINNER",
  slideCount: 8,
  themeName: "Cosmic Delight",
  layoutSequence: [
    "fullImageBackground",
    "accentRight",
    "iconGrid",
    "bigNumberLayout",
    "threeColumnsWithHeadings",
    "comparisonLayout",
    "quoteLayout",
    "callToAction",
  ],
  outlines: [
    "Product Reveal",
    "The Story Behind",
    "Key Features",
    "Key Metric",
    "Pricing Tiers",
    "Free vs Pro",
    "Early Feedback",
    "Get Started",
  ],
  isFeatured: true,
  isPremium: false,
  slides: buildProductLaunchSlides(),
};

function buildProductLaunchSlides(): Slide[] {
  return [
    {
      id: uid("pl"), slideName: "Product Reveal", type: "fullImageBackground", slideOrder: 0,
      className: "relative min-h-[500px]",
      content: col("root", [
        h1("reveal-title", "Introducing {{product_name}}"),
        para("reveal-sub", "{{product_tagline}}"),
        img("reveal-bg", "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800"),
      ]),
    },
    {
      id: uid("pl"), slideName: "The Story", type: "accentRight", slideOrder: 1,
      className: "min-h-[300px]",
      content: col("root", [
        h1("story-title", "Why We Built This"),
        para("story-desc", "{{product_story}}"),
        img("story-img", "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800"),
      ]),
    },
    {
      id: uid("pl"), slideName: "Key Features", type: "iconGrid", slideOrder: 2,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("feat-title", "Powerful Features"),
        para("feat-desc", "{{features_overview}}"),
      ]),
    },
    {
      id: uid("pl"), slideName: "Key Metric", type: "bigNumberLayout", slideOrder: 3,
      className: "p-8 mx-auto flex min-h-[400px]",
      content: col("root", [
        statBox("speed", "{{key_metric_value}}", "{{key_metric_label}}"),
        para("metric-ctx", "{{key_metric_context}}"),
      ]),
    },
    {
      id: uid("pl"), slideName: "Pricing", type: "threeColumnsWithHeadings", slideOrder: 4,
      className: "p-4 mx-auto flex justify-center items-center",
      content: col("root", [
        h1("pricing-title", "Simple Pricing"),
        para("pricing-desc", "{{pricing_overview}}"),
      ]),
    },
    {
      id: uid("pl"), slideName: "Free vs Pro", type: "comparisonLayout", slideOrder: 5,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("comp-title", "Free vs Pro"),
        para("comp-desc", "{{comparison_overview}}"),
      ]),
    },
    {
      id: uid("pl"), slideName: "Early Feedback", type: "quoteLayout", slideOrder: 6,
      className: "p-12 mx-auto flex items-center justify-center min-h-[400px]",
      content: col("root", [
        blockquote("feedback", "{{customer_feedback}}"),
        para("fb-attr", "— {{feedback_author}}"),
      ]),
    },
    {
      id: uid("pl"), slideName: "Get Started", type: "callToAction", slideOrder: 7,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("cta-title", "Ready to Get Started?"),
        para("cta-desc", "{{cta_description}}"),
        btn("cta-btn", "Try {{product_name}} Free"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// 5. TECH ARCHITECTURE (Technology)
// ═══════════════════════════════════════════════════════════
const techArch: SeedTemplate = {
  name: "System Architecture Overview",
  description:
    "A technical presentation template for engineering teams to present system design, architecture decisions, and tech stack to stakeholders.",
  category: "TECHNOLOGY",
  tags: ["tech", "architecture", "engineering", "system-design", "infrastructure", "devops"],
  difficulty: "ADVANCED",
  slideCount: 8,
  themeName: "Neon Cyberpunk",
  layoutSequence: [
    "creativeHero",
    "titleAndContent",
    "accentLeft",
    "processFlow",
    "iconGrid",
    "bigNumberLayout",
    "comparisonLayout",
    "callToAction",
  ],
  outlines: [
    "System Overview",
    "Architecture Principles",
    "Core Infrastructure",
    "Data Pipeline",
    "Tech Stack",
    "Performance Metrics",
    "Monolith vs Microservices",
    "Next Steps",
  ],
  isFeatured: false,
  isPremium: false,
  slides: buildTechSlides(),
};

function buildTechSlides(): Slide[] {
  return [
    {
      id: uid("tech"), slideName: "System Overview", type: "creativeHero", slideOrder: 0,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "{{system_name}} Architecture"),
        para("subtitle", "{{architecture_subtitle}}"),
        img("hero", "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800"),
      ]),
    },
    {
      id: uid("tech"), slideName: "Principles", type: "titleAndContent", slideOrder: 1,
      className: "p-8 mx-auto flex flex-col min-h-[400px]",
      content: col("root", [
        h1("princ-title", "Architecture Principles"),
        bulletList("principles", [
          "{{principle_1}}",
          "{{principle_2}}",
          "{{principle_3}}",
          "{{principle_4}}",
        ]),
      ]),
    },
    {
      id: uid("tech"), slideName: "Infrastructure", type: "accentLeft", slideOrder: 2,
      className: "min-h-[300px]",
      content: col("root", [
        h1("infra-title", "Core Infrastructure"),
        para("infra-desc", "{{infrastructure_description}}"),
        img("infra-img", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800"),
      ]),
    },
    {
      id: uid("tech"), slideName: "Data Pipeline", type: "processFlow", slideOrder: 3,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("pipe-title", "Data Pipeline"),
        para("pipe-desc", "{{pipeline_description}}"),
      ]),
    },
    {
      id: uid("tech"), slideName: "Tech Stack", type: "iconGrid", slideOrder: 4,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("stack-title", "Tech Stack"),
        para("stack-desc", "{{tech_stack_overview}}"),
      ]),
    },
    {
      id: uid("tech"), slideName: "Performance", type: "bigNumberLayout", slideOrder: 5,
      className: "p-8 mx-auto flex min-h-[400px]",
      content: col("root", [
        statBox("perf", "{{performance_metric}}", "{{performance_label}}"),
        para("perf-ctx", "{{performance_context}}"),
      ]),
    },
    {
      id: uid("tech"), slideName: "Architecture Choice", type: "comparisonLayout", slideOrder: 6,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("choice-title", "{{comparison_title}}"),
        para("choice-desc", "{{architecture_comparison}}"),
      ]),
    },
    {
      id: uid("tech"), slideName: "Next Steps", type: "callToAction", slideOrder: 7,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("next-title", "Engineering Roadmap"),
        para("next-desc", "{{roadmap_summary}}"),
        btn("next-cta", "View Technical Docs"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// 6. PROJECT KICKOFF (Project Management)
// ═══════════════════════════════════════════════════════════
const projectKickoff: SeedTemplate = {
  name: "Project Kickoff",
  description:
    "A structured template for project kick-off meetings. Covers objectives, scope, timeline, team roles, and success criteria.",
  category: "PROJECT_MANAGEMENT",
  tags: ["project", "kickoff", "planning", "team", "scope", "agile"],
  difficulty: "BEGINNER",
  slideCount: 8,
  themeName: "Arctic Aurora",
  layoutSequence: [
    "creativeHero",
    "titleAndContent",
    "twoColumnsWithHeadings",
    "iconGrid",
    "timelineLayout",
    "processFlow",
    "statsRow",
    "callToAction",
  ],
  outlines: [
    "Project Title",
    "Project Objectives",
    "Scope & Constraints",
    "Team Roles",
    "Timeline & Milestones",
    "Communication Plan",
    "Success Criteria",
    "Let's Get Started",
  ],
  isFeatured: false,
  isPremium: false,
  slides: buildKickoffSlides(),
};

function buildKickoffSlides(): Slide[] {
  return [
    {
      id: uid("kick"), slideName: "Title", type: "creativeHero", slideOrder: 0,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "{{project_name}}"),
        para("sub", "Project Kickoff • {{kickoff_date}}"),
        img("hero", "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800"),
      ]),
    },
    {
      id: uid("kick"), slideName: "Objectives", type: "titleAndContent", slideOrder: 1,
      className: "p-8 mx-auto flex flex-col min-h-[400px]",
      content: col("root", [
        h1("obj-title", "Project Objectives"),
        bulletList("objectives", ["{{objective_1}}", "{{objective_2}}", "{{objective_3}}"]),
      ]),
    },
    {
      id: uid("kick"), slideName: "Scope", type: "twoColumnsWithHeadings", slideOrder: 2,
      className: "p-4 mx-auto flex justify-center items-center",
      content: col("root", [
        h1("scope-title", "Scope & Constraints"),
        para("in-scope", "{{in_scope}}"),
        para("out-scope", "{{out_of_scope}}"),
      ]),
    },
    {
      id: uid("kick"), slideName: "Team", type: "iconGrid", slideOrder: 3,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("team-title", "Team & Roles"),
        para("team-desc", "{{team_overview}}"),
      ]),
    },
    {
      id: uid("kick"), slideName: "Timeline", type: "timelineLayout", slideOrder: 4,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("time-title", "Timeline & Milestones"),
        para("time-desc", "{{timeline_overview}}"),
      ]),
    },
    {
      id: uid("kick"), slideName: "Communication", type: "processFlow", slideOrder: 5,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("comm-title", "Communication Plan"),
        para("comm-desc", "{{communication_plan}}"),
      ]),
    },
    {
      id: uid("kick"), slideName: "Success Criteria", type: "statsRow", slideOrder: 6,
      className: "h-full w-full p-8 flex flex-col justify-center",
      content: col("root", [
        h1("success-title", "Success Criteria"),
        statBox("s1", "{{success_metric_1}}", "{{success_label_1}}"),
        statBox("s2", "{{success_metric_2}}", "{{success_label_2}}"),
      ]),
    },
    {
      id: uid("kick"), slideName: "Let's Go", type: "callToAction", slideOrder: 7,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("go-title", "Let's Build Something Great"),
        para("go-desc", "{{closing_message}}"),
        btn("go-cta", "View Project Board"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// 7. MINIMAL ZEN (Minimal)
// ═══════════════════════════════════════════════════════════
const minimalZen: SeedTemplate = {
  name: "Zen Minimal",
  description:
    "An ultra-clean, distraction-free template. One idea per slide, maximum white space. Perfect for TED-style talks and keynotes.",
  category: "MINIMAL",
  tags: ["minimal", "clean", "zen", "keynote", "simple", "elegant"],
  difficulty: "BEGINNER",
  slideCount: 6,
  themeName: "Minimalist Mono",
  layoutSequence: [
    "creativeHero",
    "bigNumberLayout",
    "quoteLayout",
    "titleAndContent",
    "accentRight",
    "callToAction",
  ],
  outlines: [
    "Title",
    "The Big Idea",
    "Inspiring Quote",
    "Key Points",
    "Visual Story",
    "Closing",
  ],
  isFeatured: false,
  isPremium: false,
  slides: buildMinimalSlides(),
};

function buildMinimalSlides(): Slide[] {
  return [
    {
      id: uid("zen"), slideName: "Title", type: "creativeHero", slideOrder: 0,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "{{presentation_title}}"),
        para("sub", "{{subtitle}}"),
      ]),
    },
    {
      id: uid("zen"), slideName: "Big Idea", type: "bigNumberLayout", slideOrder: 1,
      className: "p-8 mx-auto flex min-h-[400px]",
      content: col("root", [
        statBox("big", "{{big_number}}", "{{big_number_label}}"),
        para("context", "{{big_number_context}}"),
      ]),
    },
    {
      id: uid("zen"), slideName: "Quote", type: "quoteLayout", slideOrder: 2,
      className: "p-12 mx-auto flex items-center justify-center min-h-[400px]",
      content: col("root", [
        blockquote("quote", "{{inspirational_quote}}"),
        para("author", "— {{quote_author}}"),
      ]),
    },
    {
      id: uid("zen"), slideName: "Key Points", type: "titleAndContent", slideOrder: 3,
      className: "p-8 mx-auto flex flex-col min-h-[400px]",
      content: col("root", [
        h1("points-title", "{{section_title}}"),
        bulletList("points", ["{{point_1}}", "{{point_2}}", "{{point_3}}"]),
      ]),
    },
    {
      id: uid("zen"), slideName: "Visual", type: "accentRight", slideOrder: 4,
      className: "min-h-[300px]",
      content: col("root", [
        h1("vis-title", "{{visual_title}}"),
        para("vis-desc", "{{visual_description}}"),
        img("vis-img", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"),
      ]),
    },
    {
      id: uid("zen"), slideName: "Closing", type: "callToAction", slideOrder: 5,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("close-title", "{{closing_title}}"),
        para("close-desc", "{{closing_message}}"),
        btn("close-cta", "{{cta_text}}"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// 8. DATA ANALYSIS REPORT (Data & Research)
// ═══════════════════════════════════════════════════════════
const dataReport: SeedTemplate = {
  name: "Data Analysis Report",
  description:
    "A data-driven template for presenting research findings, survey results, and analytical insights with emphasis on metrics and visualizations.",
  category: "DATA_RESEARCH",
  tags: ["data", "analysis", "research", "survey", "metrics", "insights"],
  difficulty: "INTERMEDIATE",
  slideCount: 8,
  themeName: "Charcoal Copper",
  layoutSequence: [
    "creativeHero",
    "titleAndContent",
    "statsRow",
    "bentoGrid",
    "accentLeft",
    "bigNumberLayout",
    "comparisonLayout",
    "callToAction",
  ],
  outlines: [
    "Report Title",
    "Methodology",
    "Key Findings",
    "Data Dashboard",
    "Deep Dive",
    "Critical Insight",
    "Before vs After",
    "Recommendations",
  ],
  isFeatured: false,
  isPremium: true,
  slides: buildDataSlides(),
};

function buildDataSlides(): Slide[] {
  return [
    {
      id: uid("data"), slideName: "Title", type: "creativeHero", slideOrder: 0,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "{{report_title}}"),
        para("sub", "{{report_subtitle}} • {{report_date}}"),
        img("hero", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"),
      ]),
    },
    {
      id: uid("data"), slideName: "Methodology", type: "titleAndContent", slideOrder: 1,
      className: "p-8 mx-auto flex flex-col min-h-[400px]",
      content: col("root", [
        h1("meth-title", "Research Methodology"),
        bulletList("methodology", ["{{method_1}}", "{{method_2}}", "{{method_3}}"]),
        para("sample", "{{sample_size_description}}"),
      ]),
    },
    {
      id: uid("data"), slideName: "Key Findings", type: "statsRow", slideOrder: 2,
      className: "h-full w-full p-8 flex flex-col justify-center",
      content: col("root", [
        h1("findings-title", "Key Findings"),
        statBox("f1", "{{finding_1_value}}", "{{finding_1_label}}"),
        statBox("f2", "{{finding_2_value}}", "{{finding_2_label}}"),
        statBox("f3", "{{finding_3_value}}", "{{finding_3_label}}"),
      ]),
    },
    {
      id: uid("data"), slideName: "Dashboard", type: "bentoGrid", slideOrder: 3,
      className: "h-full w-full p-6",
      content: col("root", [
        h1("dash-title", "Data Dashboard"),
        para("dash-desc", "{{dashboard_overview}}"),
        img("dash-img", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"),
      ]),
    },
    {
      id: uid("data"), slideName: "Deep Dive", type: "accentLeft", slideOrder: 4,
      className: "min-h-[300px]",
      content: col("root", [
        h1("deep-title", "{{deep_dive_topic}}"),
        para("deep-desc", "{{deep_dive_analysis}}"),
        img("deep-img", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"),
      ]),
    },
    {
      id: uid("data"), slideName: "Critical Insight", type: "bigNumberLayout", slideOrder: 5,
      className: "p-8 mx-auto flex min-h-[400px]",
      content: col("root", [
        statBox("insight", "{{insight_number}}", "{{insight_label}}"),
        para("insight-ctx", "{{insight_context}}"),
      ]),
    },
    {
      id: uid("data"), slideName: "Before vs After", type: "comparisonLayout", slideOrder: 6,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("ba-title", "{{comparison_title}}"),
        para("ba-desc", "{{comparison_analysis}}"),
      ]),
    },
    {
      id: uid("data"), slideName: "Recommendations", type: "callToAction", slideOrder: 7,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("rec-title", "Recommendations"),
        para("rec-desc", "{{recommendations_summary}}"),
        btn("rec-cta", "Download Full Report"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// CONTENT BUILDER HELPERS
// ═══════════════════════════════════════════════════════════

function col(name: string, children: ContentItem[]): ContentItem {
  return {
    id: uid("col"),
    type: "column" as any,
    name,
    content: children,
    className: "flex flex-col gap-4 w-full",
  };
}

function h1(name: string, text: string): ContentItem {
  return {
    id: uid("h1"),
    type: "heading1" as any,
    name,
    content: text,
    placeholder: text.startsWith("{{") ? text.replace(/\{\{|\}\}/g, "").replace(/_/g, " ") : undefined,
  };
}

function para(name: string, text: string): ContentItem {
  return {
    id: uid("p"),
    type: "paragraph" as any,
    name,
    content: text,
    placeholder: text.startsWith("{{") ? text.replace(/\{\{|\}\}/g, "").replace(/_/g, " ") : undefined,
  };
}

function img(name: string, src: string): ContentItem {
  return {
    id: uid("img"),
    type: "image" as any,
    name,
    content: src,
    alt: name,
  };
}

function bulletList(name: string, items: string[]): ContentItem {
  return {
    id: uid("bl"),
    type: "bulletList" as any,
    name,
    content: items,
  };
}

function blockquote(name: string, text: string): ContentItem {
  return {
    id: uid("bq"),
    type: "blockquote" as any,
    name,
    content: text,
  };
}

function statBox(name: string, value: string, label: string): ContentItem {
  return {
    id: uid("stat"),
    type: "statBox" as any,
    name,
    content: [
      { id: uid("sv"), type: "heading2" as any, name: "value", content: value },
      { id: uid("sl"), type: "paragraph" as any, name: "label", content: label },
    ],
  };
}

function btn(name: string, text: string): ContentItem {
  return {
    id: uid("btn"),
    type: "customButton" as any,
    name,
    content: text,
  };
}

// ═══════════════════════════════════════════════════════════
// 9. CREATIVE PORTFOLIO (Creative & Portfolio)
// ═══════════════════════════════════════════════════════════
const creativePortfolio: SeedTemplate = {
  name: "Design Portfolio Showcase",
  description:
    "A visually stunning portfolio template for designers, photographers, and creatives. Showcase your best work with full-bleed images and minimal text.",
  category: "CREATIVE",
  tags: ["portfolio", "design", "creative", "showcase", "photography", "art"],
  difficulty: "BEGINNER",
  slideCount: 8,
  themeName: "Sunset Blaze",
  layoutSequence: [
    "fullImageBackground",
    "accentLeft",
    "threeColumnsWithHeadings",
    "accentRight",
    "bigNumberLayout",
    "quoteLayout",
    "iconGrid",
    "callToAction",
  ],
  outlines: [
    "Portfolio Hero",
    "About Me",
    "Featured Projects",
    "Case Study Highlight",
    "Impact & Results",
    "Client Testimonial",
    "Skills & Tools",
    "Let's Work Together",
  ],
  isFeatured: true,
  isPremium: false,
  slides: buildCreativeSlides(),
};

function buildCreativeSlides(): Slide[] {
  return [
    {
      id: uid("cre"), slideName: "Portfolio Hero", type: "fullImageBackground", slideOrder: 0,
      className: "relative min-h-[500px]",
      content: col("root", [
        h1("title", "{{designer_name}}"),
        para("sub", "{{creative_discipline}} • {{location}}"),
        img("hero", "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800"),
      ]),
    },
    {
      id: uid("cre"), slideName: "About Me", type: "accentLeft", slideOrder: 1,
      className: "min-h-[300px]",
      content: col("root", [
        h1("about-title", "About Me"),
        para("about-desc", "{{bio_description}}"),
        img("about-img", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"),
      ]),
    },
    {
      id: uid("cre"), slideName: "Featured Projects", type: "threeColumnsWithHeadings", slideOrder: 2,
      className: "p-4 mx-auto flex justify-center items-center",
      content: col("root", [
        h1("proj-title", "Featured Work"),
        para("proj-desc", "{{projects_overview}}"),
      ]),
    },
    {
      id: uid("cre"), slideName: "Case Study", type: "accentRight", slideOrder: 3,
      className: "min-h-[300px]",
      content: col("root", [
        h1("case-title", "{{case_study_title}}"),
        para("case-desc", "{{case_study_description}}"),
        img("case-img", "https://images.unsplash.com/photo-1558655146-364adaf1fcc9?w=800"),
      ]),
    },
    {
      id: uid("cre"), slideName: "Impact", type: "bigNumberLayout", slideOrder: 4,
      className: "p-8 mx-auto flex min-h-[400px]",
      content: col("root", [
        statBox("impact", "{{impact_number}}", "{{impact_label}}"),
        para("impact-ctx", "{{impact_context}}"),
      ]),
    },
    {
      id: uid("cre"), slideName: "Testimonial", type: "quoteLayout", slideOrder: 5,
      className: "p-12 mx-auto flex items-center justify-center min-h-[400px]",
      content: col("root", [
        blockquote("quote", "{{client_quote}}"),
        para("attribution", "— {{client_name}}, {{client_company}}"),
      ]),
    },
    {
      id: uid("cre"), slideName: "Skills", type: "iconGrid", slideOrder: 6,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("skills-title", "Skills & Tools"),
        para("skills-desc", "{{skills_overview}}"),
      ]),
    },
    {
      id: uid("cre"), slideName: "Contact", type: "callToAction", slideOrder: 7,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("cta-title", "Let's Create Something Amazing"),
        para("cta-desc", "{{contact_info}}"),
        btn("cta-btn", "Get in Touch"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// 10. WEDDING PLANNER (Personal & Events)
// ═══════════════════════════════════════════════════════════
const weddingPlanner: SeedTemplate = {
  name: "Event Showcase",
  description:
    "A beautiful, warm template for weddings, anniversaries, birthday celebrations, and other personal events. Features elegant typography and photo-forward layouts.",
  category: "PERSONAL_EVENTS",
  tags: ["wedding", "event", "celebration", "personal", "party", "anniversary"],
  difficulty: "BEGINNER",
  slideCount: 7,
  themeName: "Rose Garden",
  layoutSequence: [
    "fullImageBackground",
    "accentRight",
    "threeColumnsWithHeadings",
    "timelineLayout",
    "quoteLayout",
    "iconGrid",
    "callToAction",
  ],
  outlines: [
    "Event Title",
    "Our Story",
    "Highlights",
    "Timeline of Events",
    "A Special Message",
    "The Details",
    "RSVP & Contact",
  ],
  isFeatured: false,
  isPremium: false,
  slides: buildEventSlides(),
};

function buildEventSlides(): Slide[] {
  return [
    {
      id: uid("evt"), slideName: "Event Title", type: "fullImageBackground", slideOrder: 0,
      className: "relative min-h-[500px]",
      content: col("root", [
        h1("title", "{{event_title}}"),
        para("sub", "{{event_date}} • {{event_location}}"),
        img("hero", "https://images.unsplash.com/photo-1519741497674-611481863552?w=800"),
      ]),
    },
    {
      id: uid("evt"), slideName: "Our Story", type: "accentRight", slideOrder: 1,
      className: "min-h-[300px]",
      content: col("root", [
        h1("story-title", "{{story_heading}}"),
        para("story-desc", "{{story_description}}"),
        img("story-img", "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800"),
      ]),
    },
    {
      id: uid("evt"), slideName: "Highlights", type: "threeColumnsWithHeadings", slideOrder: 2,
      className: "p-4 mx-auto flex justify-center items-center",
      content: col("root", [
        h1("high-title", "Memorable Moments"),
        para("high-desc", "{{highlights_overview}}"),
      ]),
    },
    {
      id: uid("evt"), slideName: "Timeline", type: "timelineLayout", slideOrder: 3,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("time-title", "Event Schedule"),
        para("time-desc", "{{event_schedule}}"),
      ]),
    },
    {
      id: uid("evt"), slideName: "Special Message", type: "quoteLayout", slideOrder: 4,
      className: "p-12 mx-auto flex items-center justify-center min-h-[400px]",
      content: col("root", [
        blockquote("msg", "{{special_message}}"),
        para("from", "— {{message_from}}"),
      ]),
    },
    {
      id: uid("evt"), slideName: "Details", type: "iconGrid", slideOrder: 5,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("det-title", "Event Details"),
        para("det-desc", "{{event_details}}"),
      ]),
    },
    {
      id: uid("evt"), slideName: "RSVP", type: "callToAction", slideOrder: 6,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("rsvp-title", "We'd Love to See You There"),
        para("rsvp-desc", "{{rsvp_info}}"),
        btn("rsvp-btn", "RSVP Now"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// 11. EMPLOYEE ONBOARDING (Training & Onboarding)
// ═══════════════════════════════════════════════════════════
const employeeOnboarding: SeedTemplate = {
  name: "Employee Onboarding Guide",
  description:
    "A welcoming, comprehensive onboarding template for new hires. Covers company culture, team introductions, tools, benefits, and first-week agenda.",
  category: "TRAINING",
  tags: ["onboarding", "training", "hr", "employee", "new-hire", "orientation"],
  difficulty: "BEGINNER",
  slideCount: 8,
  themeName: "Ocean Breeze",
  layoutSequence: [
    "creativeHero",
    "titleAndContent",
    "iconGrid",
    "accentLeft",
    "processFlow",
    "twoColumnsWithHeadings",
    "timelineLayout",
    "callToAction",
  ],
  outlines: [
    "Welcome!",
    "Our Mission & Values",
    "Meet Your Team",
    "Your Workspace & Tools",
    "How We Work",
    "Benefits & Perks",
    "Your First Week",
    "Questions & Resources",
  ],
  isFeatured: false,
  isPremium: false,
  slides: buildOnboardingSlides(),
};

function buildOnboardingSlides(): Slide[] {
  return [
    {
      id: uid("onb"), slideName: "Welcome", type: "creativeHero", slideOrder: 0,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "Welcome to {{company_name}}!"),
        para("sub", "New Hire Orientation • {{start_date}}"),
        img("hero", "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800"),
      ]),
    },
    {
      id: uid("onb"), slideName: "Mission", type: "titleAndContent", slideOrder: 1,
      className: "p-8 mx-auto flex flex-col min-h-[400px]",
      content: col("root", [
        h1("mission-title", "Our Mission & Values"),
        para("mission-stmt", "{{mission_statement}}"),
        bulletList("values", ["{{value_1}}", "{{value_2}}", "{{value_3}}", "{{value_4}}"]),
      ]),
    },
    {
      id: uid("onb"), slideName: "Team", type: "iconGrid", slideOrder: 2,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("team-title", "Meet Your Team"),
        para("team-desc", "{{team_overview}}"),
      ]),
    },
    {
      id: uid("onb"), slideName: "Tools", type: "accentLeft", slideOrder: 3,
      className: "min-h-[300px]",
      content: col("root", [
        h1("tools-title", "Your Workspace & Tools"),
        para("tools-desc", "{{tools_description}}"),
        img("tools-img", "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"),
      ]),
    },
    {
      id: uid("onb"), slideName: "How We Work", type: "processFlow", slideOrder: 4,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("process-title", "How We Work"),
        para("process-desc", "{{work_process_description}}"),
      ]),
    },
    {
      id: uid("onb"), slideName: "Benefits", type: "twoColumnsWithHeadings", slideOrder: 5,
      className: "p-4 mx-auto flex justify-center items-center",
      content: col("root", [
        h1("ben-title", "Benefits & Perks"),
        para("ben-desc", "{{benefits_overview}}"),
      ]),
    },
    {
      id: uid("onb"), slideName: "First Week", type: "timelineLayout", slideOrder: 6,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("week-title", "Your First Week"),
        para("week-desc", "{{first_week_agenda}}"),
      ]),
    },
    {
      id: uid("onb"), slideName: "Resources", type: "callToAction", slideOrder: 7,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("res-title", "Questions? We're Here!"),
        para("res-desc", "{{resources_info}}"),
        btn("res-cta", "Open Employee Handbook"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// 12. SAAS INVESTOR UPDATE (Startup — Premium)
// ═══════════════════════════════════════════════════════════
const saasInvestorUpdate: SeedTemplate = {
  name: "SaaS Investor Update",
  description:
    "A polished monthly/quarterly investor update for SaaS startups. Covers MRR, churn, pipeline, runway, and strategic updates.",
  category: "STARTUP_PITCH",
  tags: ["saas", "investor", "update", "mrr", "metrics", "startup"],
  difficulty: "INTERMEDIATE",
  slideCount: 8,
  themeName: "Deep Ocean",
  layoutSequence: [
    "creativeHero",
    "statsRow",
    "bigNumberLayout",
    "twoColumnsWithHeadings",
    "accentRight",
    "processFlow",
    "timelineLayout",
    "callToAction",
  ],
  outlines: [
    "Monthly Update",
    "Key SaaS Metrics",
    "MRR Growth",
    "Wins & Challenges",
    "Product Roadmap",
    "Sales Pipeline",
    "Upcoming Milestones",
    "How You Can Help",
  ],
  isFeatured: false,
  isPremium: true,
  slides: buildSaaSUpdateSlides(),
};

function buildSaaSUpdateSlides(): Slide[] {
  return [
    {
      id: uid("saas"), slideName: "Update Title", type: "creativeHero", slideOrder: 0,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "{{company_name}} — {{month}} Update"),
        para("sub", "Investor Update • {{date}}"),
        img("hero", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"),
      ]),
    },
    {
      id: uid("saas"), slideName: "Metrics", type: "statsRow", slideOrder: 1,
      className: "h-full w-full p-8 flex flex-col justify-center",
      content: col("root", [
        h1("metrics-title", "Key SaaS Metrics"),
        statBox("mrr", "{{mrr}}", "MRR"),
        statBox("churn", "{{churn_rate}}", "Monthly Churn"),
        statBox("arpu", "{{arpu}}", "ARPU"),
      ]),
    },
    {
      id: uid("saas"), slideName: "MRR Growth", type: "bigNumberLayout", slideOrder: 2,
      className: "p-8 mx-auto flex min-h-[400px]",
      content: col("root", [
        statBox("mrr-growth", "{{mrr_growth}}", "MRR Growth"),
        para("mrr-ctx", "{{mrr_growth_context}}"),
      ]),
    },
    {
      id: uid("saas"), slideName: "Wins Challenges", type: "twoColumnsWithHeadings", slideOrder: 3,
      className: "p-4 mx-auto flex justify-center items-center",
      content: col("root", [
        h1("wc-title", "Wins & Challenges"),
        para("wins", "{{wins_summary}}"),
        para("challenges", "{{challenges_summary}}"),
      ]),
    },
    {
      id: uid("saas"), slideName: "Roadmap", type: "accentRight", slideOrder: 4,
      className: "min-h-[300px]",
      content: col("root", [
        h1("road-title", "Product Roadmap"),
        para("road-desc", "{{roadmap_description}}"),
        img("road-img", "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800"),
      ]),
    },
    {
      id: uid("saas"), slideName: "Pipeline", type: "processFlow", slideOrder: 5,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("pipe-title", "Sales Pipeline"),
        para("pipe-desc", "{{pipeline_description}}"),
      ]),
    },
    {
      id: uid("saas"), slideName: "Milestones", type: "timelineLayout", slideOrder: 6,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("mile-title", "Upcoming Milestones"),
        para("mile-desc", "{{milestones_overview}}"),
      ]),
    },
    {
      id: uid("saas"), slideName: "Ask", type: "callToAction", slideOrder: 7,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("ask-title", "How You Can Help"),
        para("ask-desc", "{{investor_ask}}"),
        btn("ask-cta", "Schedule a Call"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// 13. SALES PLAYBOOK (Marketing — Premium)
// ═══════════════════════════════════════════════════════════
const salesPlaybook: SeedTemplate = {
  name: "Sales Playbook",
  description:
    "A comprehensive sales enablement template covering ICP, objection handling, competitive positioning, pricing strategies, and closing techniques.",
  category: "MARKETING",
  tags: ["sales", "playbook", "enablement", "objections", "strategy", "closing"],
  difficulty: "ADVANCED",
  slideCount: 8,
  themeName: "Professional Slate",
  layoutSequence: [
    "creativeHero",
    "titleAndContent",
    "comparisonLayout",
    "iconGrid",
    "processFlow",
    "twoColumnsWithHeadings",
    "quoteLayout",
    "callToAction",
  ],
  outlines: [
    "Playbook Cover",
    "Ideal Customer Profile",
    "Us vs Competition",
    "Key Value Props",
    "Sales Process",
    "Objection Handling",
    "Success Stories",
    "Closing Framework",
  ],
  isFeatured: false,
  isPremium: true,
  slides: buildSalesSlides(),
};

function buildSalesSlides(): Slide[] {
  return [
    {
      id: uid("sale"), slideName: "Cover", type: "creativeHero", slideOrder: 0,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "{{product_name}} Sales Playbook"),
        para("sub", "{{team_name}} • {{version}}"),
        img("hero", "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800"),
      ]),
    },
    {
      id: uid("sale"), slideName: "ICP", type: "titleAndContent", slideOrder: 1,
      className: "p-8 mx-auto flex flex-col min-h-[400px]",
      content: col("root", [
        h1("icp-title", "Ideal Customer Profile"),
        bulletList("icp", ["{{icp_trait_1}}", "{{icp_trait_2}}", "{{icp_trait_3}}", "{{icp_trait_4}}"]),
      ]),
    },
    {
      id: uid("sale"), slideName: "Competition", type: "comparisonLayout", slideOrder: 2,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("comp-title", "Us vs Competition"),
        para("comp-desc", "{{competitive_analysis}}"),
      ]),
    },
    {
      id: uid("sale"), slideName: "Value Props", type: "iconGrid", slideOrder: 3,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("vp-title", "Key Value Propositions"),
        para("vp-desc", "{{value_props_overview}}"),
      ]),
    },
    {
      id: uid("sale"), slideName: "Process", type: "processFlow", slideOrder: 4,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("proc-title", "Sales Process"),
        para("proc-desc", "{{sales_process_description}}"),
      ]),
    },
    {
      id: uid("sale"), slideName: "Objections", type: "twoColumnsWithHeadings", slideOrder: 5,
      className: "p-4 mx-auto flex justify-center items-center",
      content: col("root", [
        h1("obj-title", "Objection Handling"),
        para("obj-desc", "{{objection_handling_guide}}"),
      ]),
    },
    {
      id: uid("sale"), slideName: "Success", type: "quoteLayout", slideOrder: 6,
      className: "p-12 mx-auto flex items-center justify-center min-h-[400px]",
      content: col("root", [
        blockquote("story", "{{success_story_quote}}"),
        para("attr", "— {{customer_name}}, {{customer_company}}"),
      ]),
    },
    {
      id: uid("sale"), slideName: "Closing", type: "callToAction", slideOrder: 7,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("close-title", "Closing Framework"),
        para("close-desc", "{{closing_strategy}}"),
        btn("close-cta", "View Full Playbook"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// 14. COMPLIANCE TRAINING (Training — Premium)
// ═══════════════════════════════════════════════════════════
const complianceTraining: SeedTemplate = {
  name: "Compliance & Safety Training",
  description:
    "A structured compliance/safety training template for HR and operations teams. Covers policies, procedures, quizzes, and certification requirements.",
  category: "TRAINING",
  tags: ["compliance", "safety", "training", "policy", "certification", "hr"],
  difficulty: "INTERMEDIATE",
  slideCount: 8,
  themeName: "Emerald Darkness",
  layoutSequence: [
    "creativeHero",
    "titleAndContent",
    "iconGrid",
    "processFlow",
    "comparisonLayout",
    "bigNumberLayout",
    "accentLeft",
    "callToAction",
  ],
  outlines: [
    "Training Overview",
    "Why This Matters",
    "Key Policies",
    "Incident Response",
    "Do's and Don'ts",
    "Key Statistics",
    "Resources",
    "Acknowledgement",
  ],
  isFeatured: false,
  isPremium: true,
  slides: buildComplianceSlides(),
};

function buildComplianceSlides(): Slide[] {
  return [
    {
      id: uid("comp"), slideName: "Overview", type: "creativeHero", slideOrder: 0,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "{{training_title}}"),
        para("sub", "{{company_name}} • Mandatory Training • {{year}}"),
        img("hero", "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800"),
      ]),
    },
    {
      id: uid("comp"), slideName: "Why", type: "titleAndContent", slideOrder: 1,
      className: "p-8 mx-auto flex flex-col min-h-[400px]",
      content: col("root", [
        h1("why-title", "Why This Training Matters"),
        bulletList("why-list", ["{{reason_1}}", "{{reason_2}}", "{{reason_3}}"]),
        para("penalty", "{{non_compliance_consequences}}"),
      ]),
    },
    {
      id: uid("comp"), slideName: "Policies", type: "iconGrid", slideOrder: 2,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("pol-title", "Key Policies"),
        para("pol-desc", "{{policies_overview}}"),
      ]),
    },
    {
      id: uid("comp"), slideName: "Incident Response", type: "processFlow", slideOrder: 3,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("inc-title", "Incident Response Procedure"),
        para("inc-desc", "{{incident_procedure}}"),
      ]),
    },
    {
      id: uid("comp"), slideName: "Do Dont", type: "comparisonLayout", slideOrder: 4,
      className: "p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("dd-title", "Do's and Don'ts"),
        para("dd-desc", "{{dos_and_donts}}"),
      ]),
    },
    {
      id: uid("comp"), slideName: "Statistics", type: "bigNumberLayout", slideOrder: 5,
      className: "p-8 mx-auto flex min-h-[400px]",
      content: col("root", [
        statBox("stat", "{{key_stat_value}}", "{{key_stat_label}}"),
        para("stat-ctx", "{{stat_context}}"),
      ]),
    },
    {
      id: uid("comp"), slideName: "Resources", type: "accentLeft", slideOrder: 6,
      className: "min-h-[300px]",
      content: col("root", [
        h1("res-title", "Resources & References"),
        para("res-desc", "{{resources_list}}"),
        img("res-img", "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800"),
      ]),
    },
    {
      id: uid("comp"), slideName: "Acknowledgement", type: "callToAction", slideOrder: 7,
      className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
      content: col("root", [
        h1("ack-title", "Training Complete"),
        para("ack-desc", "{{acknowledgement_text}}"),
        btn("ack-cta", "Sign Acknowledgement"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// 15. AGENTIC AI — LAYOUT SHOWCASE (Technology — Featured)
// ═══════════════════════════════════════════════════════════
const agenticAI: SeedTemplate = {
  name: "Agentic AI",
  description:
    "A comprehensive, layout-rich presentation exploring the world of Agentic AI — autonomous systems that perceive, reason, and act. Showcases every layout type available with stunning content on AI agents, multi-agent orchestration, and the future of intelligent automation.",
  category: "TECHNOLOGY",
  tags: ["agentic-ai", "ai-agents", "autonomous", "llm", "multi-agent", "artificial-intelligence", "technology", "future"],
  difficulty: "INTERMEDIATE",
  slideCount: 20,
  themeName: "Cosmic Delight",
  layoutSequence: [
    "gradientHero",
    "agendaSlide",
    "creativeHero",
    "titleAndContent",
    "accentLeft",
    "bigNumberLayout",
    "iconGrid",
    "comparisonLayout",
    "processFlow",
    "bentoGrid",
    "statsRow",
    "featureShowcase",
    "timeline",
    "splitContentImage",
    "metricDashboard",
    "testimonialSlide",
    "teamGrid",
    "sectionDivider",
    "pricingTable",
    "thankYouSlide",
  ],
  outlines: [
    "Agentic AI — The Future Is Autonomous",
    "Presentation Agenda",
    "What Is Agentic AI?",
    "Core Principles of Agentic AI",
    "How AI Agents Perceive the World",
    "The Scale of Agentic AI",
    "Key Capabilities",
    "Traditional AI vs Agentic AI",
    "The Agent Loop",
    "Agentic AI Ecosystem",
    "Industry Adoption Metrics",
    "Why Agentic AI Matters",
    "Evolution Roadmap",
    "Multi-Agent Architecture",
    "Performance Dashboard",
    "What Leaders Are Saying",
    "Pioneers of Agentic AI",
    "Part II — Building Agents",
    "Agent Platform Tiers",
    "Thank You — Build the Future",
  ],
  isFeatured: true,
  isPremium: false,
  slides: buildAgenticAISlides(),
};

function buildAgenticAISlides(): Slide[] {
  return [
    // ── Slide 0: Gradient Hero ──
    {
      id: uid("agi"), slideName: "Agentic AI — The Future Is Autonomous", type: "gradientHero", slideOrder: 0,
      className: "h-full w-full flex items-center justify-center p-12 text-center",
      content: col("root", [
        h1("title", "Agentic AI"),
        para("subtitle", "Autonomous Systems That Perceive, Reason, Plan & Act — Reshaping Every Industry"),
        btn("cta", "Explore the Revolution →"),
      ]),
    },
    // ── Slide 1: Agenda ──
    {
      id: uid("agi"), slideName: "Presentation Agenda", type: "agendaSlide", slideOrder: 1,
      className: "h-full w-full p-8 md:p-12",
      content: col("root", [
        h1("title", "Today's Agenda"),
        bulletList("agenda", [
          "01  ·  What Is Agentic AI?",
          "02  ·  Core Principles & Capabilities",
          "03  ·  Traditional vs Agentic AI",
          "04  ·  The Agent Loop & Ecosystem",
          "05  ·  Industry Adoption & Metrics",
          "06  ·  Multi-Agent Architectures",
          "07  ·  Building Your Own Agents",
        ]),
      ]),
    },
    // ── Slide 2: Creative Hero ──
    {
      id: uid("agi"), slideName: "What Is Agentic AI?", type: "creativeHero", slideOrder: 2,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "What Is Agentic AI?"),
        para("desc", "Agentic AI refers to autonomous AI systems capable of independent decision-making, goal pursuit, and real-world action — without constant human oversight. Unlike traditional chatbots, agents can chain tools, maintain memory, and adapt strategies in real-time."),
        img("hero", "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop"),
      ]),
    },
    // ── Slide 3: Title and Content ──
    {
      id: uid("agi"), slideName: "Core Principles", type: "titleAndContent", slideOrder: 3,
      className: "p-4 md:p-8 mx-auto flex flex-col min-h-[400px]",
      content: col("root", [
        h1("title", "Core Principles of Agentic AI"),
        bulletList("principles", [
          "Autonomy — Agents operate independently, making decisions without step-by-step human guidance",
          "Goal-Directed Behavior — Every action is oriented toward achieving a defined objective",
          "Tool Use & Integration — Agents leverage APIs, databases, browsers, and code execution",
          "Memory & Context — Persistent memory enables learning from past interactions",
          "Self-Reflection — Agents evaluate their own outputs and self-correct",
          "Multi-Step Reasoning — Complex tasks are decomposed into sequential sub-tasks",
        ]),
      ]),
    },
    // ── Slide 4: Accent Left ──
    {
      id: uid("agi"), slideName: "How Agents Perceive", type: "accentLeft", slideOrder: 4,
      className: "min-h-[300px]",
      content: col("root", [
        h1("title", "How AI Agents Perceive the World"),
        para("desc", "Modern AI agents combine multiple perception modalities — vision, language, audio, and structured data — to build rich contextual models of their environment. Through retrieval-augmented generation (RAG), they access vast knowledge bases in real-time, enabling informed decision-making that rivals human experts."),
        img("perception", "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop"),
      ]),
    },
    // ── Slide 5: Big Number ──
    {
      id: uid("agi"), slideName: "The Scale of Agentic AI", type: "bigNumberLayout", slideOrder: 5,
      className: "p-4 md:p-8 mx-auto flex min-h-[400px]",
      content: col("root", [
        statBox("market", "$65B", "Projected Agentic AI Market by 2030"),
        para("context", "The agentic AI market is growing at 44% CAGR, driven by enterprise demand for autonomous workflow automation, customer service agents, and AI-powered software engineering tools."),
      ]),
    },
    // ── Slide 6: Icon Grid ──
    {
      id: uid("agi"), slideName: "Key Capabilities", type: "iconGrid", slideOrder: 6,
      className: "p-4 md:p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("title", "Key Capabilities of AI Agents"),
        bulletList("caps", [
          "🧠 Reasoning — Chain-of-thought and tree-of-thought problem solving",
          "🔧 Tool Calling — Execute code, query APIs, search the web",
          "💾 Persistent Memory — Short-term working memory + long-term knowledge stores",
          "🔄 Self-Correction — Detect errors and autonomously retry with improved strategies",
          "🤝 Collaboration — Multi-agent handoffs and delegation protocols",
          "📊 Planning — Decompose complex goals into actionable sub-tasks",
        ]),
      ]),
    },
    // ── Slide 7: Comparison ──
    {
      id: uid("agi"), slideName: "Traditional vs Agentic", type: "comparisonLayout", slideOrder: 7,
      className: "p-4 md:p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("title", "Traditional AI vs Agentic AI"),
        bulletList("traditional", [
          "Single turn request/response",
          "No memory between sessions",
          "Static capabilities, no tool use",
          "Human must orchestrate every step",
          "Limited to training data knowledge",
        ]),
        bulletList("agentic", [
          "Multi-step autonomous workflows",
          "Persistent memory and learning",
          "Dynamic tool calling and integration",
          "Self-directed goal pursuit",
          "Real-time knowledge via RAG & web",
        ]),
      ]),
    },
    // ── Slide 8: Process Flow ──
    {
      id: uid("agi"), slideName: "The Agent Loop", type: "processFlow", slideOrder: 8,
      className: "p-4 md:p-8 mx-auto min-h-[400px]",
      content: col("root", [
        h1("title", "The Agentic AI Loop"),
        para("desc", "Every AI agent follows a perception → reasoning → action → observation cycle. The agent perceives its environment, reasons about the best action, executes it using available tools, observes the result, and iterates until the goal is achieved."),
      ]),
    },
    // ── Slide 9: Bento Grid ──
    {
      id: uid("agi"), slideName: "Agentic AI Ecosystem", type: "bentoGrid", slideOrder: 9,
      className: "h-full w-full p-6",
      content: col("root", [
        h1("title", "The Agentic AI Ecosystem"),
        para("overview", "From foundational LLMs to orchestration frameworks, the ecosystem is vast and rapidly evolving."),
        bulletList("components", [
          "Foundation Models — GPT-4, Claude, Gemini, Llama",
          "Agent Frameworks — LangGraph, CrewAI, AutoGen, LiveKit Agents",
          "Tool Libraries — Browsers, Code Interpreters, API Connectors",
          "Memory Systems — Vector DBs, Knowledge Graphs, Session Stores",
          "Orchestration — Multi-agent routers, hierarchical planners",
        ]),
        img("ecosystem", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop"),
      ]),
    },
    // ── Slide 10: Stats Row ──
    {
      id: uid("agi"), slideName: "Industry Adoption", type: "statsRow", slideOrder: 10,
      className: "h-full w-full p-8 flex flex-col justify-center",
      content: col("root", [
        h1("title", "Industry Adoption Metrics"),
        statBox("s1", "72%", "of Fortune 500 companies are piloting AI agents in production"),
        statBox("s2", "10x", "productivity gain reported in software engineering workflows"),
        statBox("s3", "340%", "increase in AI agent-related job postings since 2024"),
      ]),
    },
    // ── Slide 11: Feature Showcase ──
    {
      id: uid("agi"), slideName: "Why Agentic AI Matters", type: "featureShowcase", slideOrder: 11,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "Why Agentic AI Matters"),
        para("subtitle", "Four transformative capabilities that set agentic systems apart"),
        bulletList("features", [
          "⚡ Speed — Complete in minutes what takes humans hours",
          "🔒 Reliability — Self-healing workflows with built-in error recovery",
          "🎯 Precision — Data-driven decisions free from cognitive bias",
          "🌐 Scale — Deploy thousands of agents simultaneously across domains",
        ]),
      ]),
    },
    // ── Slide 12: Visual Timeline ──
    {
      id: uid("agi"), slideName: "Evolution Roadmap", type: "timeline", slideOrder: 12,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "The Evolution of AI Agents"),
        bulletList("phases", [
          "2022: ChatGPT launches — conversational AI goes mainstream",
          "2023: AutoGPT & BabyAGI spark the autonomous agent movement",
          "2024: Enterprise-grade agent frameworks emerge (LangGraph, CrewAI)",
          "2025: Multi-agent orchestration becomes production-ready",
          "2026: Agentic AI becomes the default enterprise software paradigm",
        ]),
      ]),
    },
    // ── Slide 13: Split Content Image ──
    {
      id: uid("agi"), slideName: "Multi-Agent Architecture", type: "splitContentImage", slideOrder: 13,
      className: "min-h-[400px]",
      content: col("root", [
        h1("title", "Multi-Agent Collaboration"),
        bulletList("arch", [
          "Orchestrator agent delegates specialized tasks",
          "Research agents gather and synthesize information",
          "Code agents write, test, and deploy software",
          "Review agents validate quality and compliance",
          "All agents share a common memory backbone",
        ]),
        img("arch-img", "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop"),
      ]),
    },
    // ── Slide 14: Metric Dashboard ──
    {
      id: uid("agi"), slideName: "Performance Dashboard", type: "metricDashboard", slideOrder: 14,
      className: "h-full w-full p-8 flex flex-col justify-center",
      content: col("root", [
        h1("title", "Agent Performance Dashboard"),
        para("desc", "Real-time metrics from our deployed agent fleet across enterprise clients"),
        statBox("m1", "2.4M", "Tasks completed autonomously this month"),
        statBox("m2", "99.7%", "Success rate on first-attempt execution"),
        statBox("m3", "$18M", "Cost savings from automated workflows"),
        statBox("m4", "< 200ms", "Average agent response latency"),
      ]),
    },
    // ── Slide 15: Testimonial ──
    {
      id: uid("agi"), slideName: "What Leaders Say", type: "testimonialSlide", slideOrder: 15,
      className: "h-full w-full p-12 flex items-center justify-center",
      content: col("root", [
        blockquote("quote", "Agentic AI isn't just the next step in artificial intelligence — it's a fundamental shift in how software operates. We're moving from tools that assist to systems that accomplish. The companies that embrace this shift will define the next decade of technology."),
        para("author", "— Satya Nadella, CEO of Microsoft"),
      ]),
    },
    // ── Slide 16: Team Grid ──
    {
      id: uid("agi"), slideName: "Pioneers", type: "teamGrid", slideOrder: 16,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "Pioneers of Agentic AI"),
        para("desc", "The researchers and companies pushing the boundaries of autonomous AI systems"),
        bulletList("pioneers", [
          "OpenAI — GPT models, function calling, and Assistants API",
          "Anthropic — Claude, constitutional AI, and tool use",
          "Google DeepMind — Gemini, AlphaCode, and agent foundations",
          "LangChain — LangGraph orchestration framework",
          "Microsoft — AutoGen multi-agent framework",
          "LiveKit — Real-time voice and video AI agents",
        ]),
      ]),
    },
    // ── Slide 17: Section Divider ──
    {
      id: uid("agi"), slideName: "Part II", type: "sectionDivider", slideOrder: 17,
      className: "p-12 mx-auto flex items-center justify-center min-h-[400px] bg-linear-to-br from-primary/10 to-primary/5",
      content: col("root", [
        h1("section-num", "II"),
        h1("section-title", "Building Your Own AI Agents"),
      ]),
    },
    // ── Slide 18: Pricing Table ──
    {
      id: uid("agi"), slideName: "Agent Platforms", type: "pricingTable", slideOrder: 18,
      className: "h-full w-full p-8",
      content: col("root", [
        h1("title", "Agent Platform Tiers"),
        para("desc", "Choose the right level of agent sophistication for your use case"),
        bulletList("tiers", [
          "🟢 Starter — Single-agent, basic tool calling, session memory, $0/mo",
          "🔵 Professional — Multi-agent orchestration, RAG, persistent memory, $99/mo",
          "🟣 Enterprise — Custom models, private deployment, SLA guarantees, Custom pricing",
        ]),
      ]),
    },
    // ── Slide 19: Thank You ──
    {
      id: uid("agi"), slideName: "Thank You", type: "thankYouSlide", slideOrder: 19,
      className: "h-full w-full p-12 flex items-center justify-center text-center",
      content: col("root", [
        h1("title", "The Future Is Agentic"),
        para("closing", "The question is no longer whether AI agents will transform your industry — it's whether you'll be leading that transformation or reacting to it."),
        para("contact", "Let's build the future together."),
        btn("cta", "Start Building Agents →"),
      ]),
    },
  ];
}

// ═══════════════════════════════════════════════════════════
// EXPORT ALL SEED TEMPLATES
// ═══════════════════════════════════════════════════════════

export const SEED_TEMPLATES: SeedTemplate[] = [
  ycPitchDeck,
  quarterlyReview,
  courseOverview,
  productLaunch,
  techArch,
  projectKickoff,
  minimalZen,
  dataReport,
  creativePortfolio,
  weddingPlanner,
  employeeOnboarding,
  saasInvestorUpdate,
  salesPlaybook,
  complianceTraining,
  agenticAI,
];

