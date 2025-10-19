
import { v4 as uuidv4 } from "uuid";
import { ContentType } from "./types";

// ============================================================================
// ADVANCED COMPONENT FACTORY SYSTEM
// ============================================================================

/**
 * Component metadata interface for enhanced type safety
 */
interface ComponentMetadata {
  version: string;
  category: 'text' | 'media' | 'layout' | 'interactive' | 'data' | 'decoration';
  accessibility?: {
    ariaLabel?: string;
    role?: string;
  };
  permissions?: {
    editable: boolean;
    deletable: boolean;
    duplicatable: boolean;
  };
  styling?: {
    defaultClasses?: string;
    supportedVariants?: string[];
  };
}

/**
 * Base component interface with enhanced features
 */
interface BaseComponent {
  id: string;
  type: ContentType;
  name: string;
  content: string | string[] | any[];
  placeholder?: string;
  metadata?: ComponentMetadata;
  createdAt?: string;
  updatedAt?: string;
  // Allow additional properties for specific component types
  [key: string]: any;
}

/**
 * Component factory for creating components with consistent structure
 */
class ComponentFactory {
  private static defaultMetadata: Partial<ComponentMetadata> = {
    version: '2.0',
    permissions: {
      editable: true,
      deletable: true,
      duplicatable: true,
    },
  };

  /**
   * Creates a component with enhanced metadata
   */
  static create<T extends BaseComponent>(
    component: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
    metadata?: Partial<ComponentMetadata>
  ): T {
    const timestamp = new Date().toISOString();
    return {
      ...component,
      id: uuidv4(),
      createdAt: timestamp,
      updatedAt: timestamp,
      metadata: {
        ...this.defaultMetadata,
        ...metadata,
      },
    } as T;
  }

  /**
   * Clones a component with a new ID
   */
  static clone<T extends BaseComponent>(component: T): T {
    return {
      ...component,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      metadata: component.metadata,
    };
  }

  /**
   * Validates component structure
   */
  static validate(component: any): boolean {
    return !!(
      component &&
      component.id &&
      component.type &&
      component.name &&
      component.content !== undefined
    );
  }
}

// ============================================================================
// TEXT COMPONENTS
// ============================================================================

export const Heading1 = ComponentFactory.create(
  {
    type: "heading1" as ContentType,
    name: "Heading1",
    content: "",
    placeholder: "Enter heading 1...",
  },
  {
    category: 'text',
    accessibility: {
      role: 'heading',
      ariaLabel: 'Heading level 1',
    },
    styling: {
      defaultClasses: 'text-4xl font-bold',
      supportedVariants: ['xl', '2xl', '3xl', '4xl', '5xl'],
    },
  }
);

export const Heading2 = ComponentFactory.create(
  {
    type: "heading2" as ContentType,
    name: "Heading2",
    content: "",
    placeholder: "Enter heading 2...",
  },
  {
    category: 'text',
    accessibility: {
      role: 'heading',
      ariaLabel: 'Heading level 2',
    },
    styling: {
      defaultClasses: 'text-3xl font-semibold',
      supportedVariants: ['lg', 'xl', '2xl', '3xl'],
    },
  }
);

export const Heading3 = ComponentFactory.create(
  {
    type: "heading3" as ContentType,
    name: "Heading3",
    content: "",
    placeholder: "Enter heading 3...",
  },
  {
    category: 'text',
    accessibility: {
      role: 'heading',
      ariaLabel: 'Heading level 3',
    },
    styling: {
      defaultClasses: 'text-2xl font-semibold',
      supportedVariants: ['base', 'lg', 'xl', '2xl'],
    },
  }
);

export const Heading4 = ComponentFactory.create(
  {
    type: "heading4" as ContentType,
    name: "Heading4",
    content: "",
    placeholder: "Enter heading 4...",
  },
  {
    category: 'text',
    accessibility: {
      role: 'heading',
      ariaLabel: 'Heading level 4',
    },
    styling: {
      defaultClasses: 'text-xl font-medium',
      supportedVariants: ['sm', 'base', 'lg', 'xl'],
    },
  }
);

export const Title = ComponentFactory.create(
  {
    type: "title" as ContentType,
    name: "Title",
    content: "",
    placeholder: "Enter slide title...",
  },
  {
    category: 'text',
    accessibility: {
      role: 'heading',
      ariaLabel: 'Slide title',
    },
    styling: {
      defaultClasses: 'text-5xl font-bold text-center',
      supportedVariants: ['hero', 'display', 'title'],
    },
  }
);

export const Paragraph = ComponentFactory.create(
  {
    type: "paragraph" as ContentType,
    name: "Paragraph",
    content: "",
    placeholder: "Start typing your content...",
  },
  {
    category: 'text',
    accessibility: {
      role: 'paragraph',
    },
    styling: {
      defaultClasses: 'text-base leading-relaxed',
      supportedVariants: ['sm', 'base', 'lg'],
    },
  }
);

// ============================================================================
// LIST COMPONENTS
// ============================================================================

export const NumberedListComponent = ComponentFactory.create(
  {
    type: "numberedList" as ContentType,
    name: "Numbered List",
    content: ["First item", "Second item", "Third item"],
  },
  {
    category: 'text',
    accessibility: {
      role: 'list',
      ariaLabel: 'Ordered list',
    },
    styling: {
      defaultClasses: 'list-decimal list-inside space-y-2',
    },
  }
);

export const BulletListComponent = ComponentFactory.create(
  {
    type: "bulletList" as ContentType,
    name: "Bullet List",
    content: ["First item", "Second item", "Third item"],
  },
  {
    category: 'text',
    accessibility: {
      role: 'list',
      ariaLabel: 'Unordered list',
    },
    styling: {
      defaultClasses: 'list-disc list-inside space-y-2',
      supportedVariants: ['disc', 'circle', 'square'],
    },
  }
);

export const TodoListComponent = ComponentFactory.create(
  {
    type: "todoList" as ContentType,
    name: "Todo List",
    content: ["[ ] Task 1", "[ ] Task 2", "[ ] Task 3"],
  },
  {
    category: 'interactive',
    accessibility: {
      role: 'list',
      ariaLabel: 'Checklist',
    },
    styling: {
      defaultClasses: 'space-y-2',
    },
  }
);

// ============================================================================
// SPECIAL TEXT COMPONENTS
// ============================================================================

export const Blockquote = ComponentFactory.create(
  {
    type: "blockquote" as ContentType,
    name: "Blockquote",
    content: "",
    placeholder: "Enter quote...",
  },
  {
    category: 'text',
    accessibility: {
      role: 'blockquote',
    },
    styling: {
      defaultClasses: 'border-l-4 pl-4 italic text-lg',
      supportedVariants: ['default', 'emphasized', 'minimal'],
    },
  }
);

export const CalloutBoxComponent = ComponentFactory.create(
  {
    type: "calloutBox" as ContentType,
    name: "Callout Box",
    content: "This is an important callout",
  },
  {
    category: 'decoration',
    accessibility: {
      role: 'note',
      ariaLabel: 'Callout box',
    },
    styling: {
      defaultClasses: 'p-4 rounded-lg border-l-4 bg-opacity-10',
      supportedVariants: ['info', 'warning', 'success', 'error'],
    },
  }
);

export const CodeBlockComponent = ComponentFactory.create(
  {
    type: "codeBlock" as ContentType,
    name: "Code Block",
    language: "javascript",
    content: "console.log('Hello World!');",
  },
  {
    category: 'text',
    accessibility: {
      role: 'code',
    },
    styling: {
      defaultClasses: 'font-mono text-sm bg-gray-900 text-white p-4 rounded-lg',
      supportedVariants: ['dark', 'light', 'minimal'],
    },
  }
);

// ============================================================================
// MEDIA COMPONENTS
// ============================================================================

export const CustomImage = ComponentFactory.create(
  {
    type: "image" as ContentType,
    name: "Image",
    content: "",
    alt: "Image",
  },
  {
    category: 'media',
    accessibility: {
      role: 'img',
      ariaLabel: 'Image component',
    },
    styling: {
      defaultClasses: 'w-full h-auto object-cover rounded',
      supportedVariants: ['cover', 'contain', 'fill', 'none'],
    },
  }
);

// ============================================================================
// DATA COMPONENTS
// ============================================================================

export const Table = ComponentFactory.create(
  {
    type: "table" as ContentType,
    name: "Table",
    initialRows: 2,
    initialColumns: 2,
    content: [],
  },
  {
    category: 'data',
    accessibility: {
      role: 'table',
      ariaLabel: 'Data table',
    },
    styling: {
      defaultClasses: 'w-full border-collapse',
      supportedVariants: ['striped', 'bordered', 'hover', 'compact'],
    },
  }
);

export const TableOfContentsComponent = ComponentFactory.create(
  {
    type: "tableOfContents" as ContentType,
    name: "Table of Contents",
    content: ["Section 1", "Section 2", "Section 3"],
  },
  {
    category: 'data',
    accessibility: {
      role: 'navigation',
      ariaLabel: 'Table of contents',
    },
    styling: {
      defaultClasses: 'space-y-2 pl-4',
    },
  }
);

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

export const CustomButtonComponent = ComponentFactory.create(
  {
    type: "customButton" as ContentType,
    name: "Custom Button",
    content: "Click me",
    link: "#",
    bgColor: "#3b82f6",
    isTransparent: false,
  },
  {
    category: 'interactive',
    accessibility: {
      role: 'button',
      ariaLabel: 'Custom button',
    },
    styling: {
      defaultClasses: 'px-6 py-3 rounded-lg font-medium transition-all',
      supportedVariants: ['primary', 'secondary', 'outline', 'ghost'],
    },
  }
);

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export const DividerComponent = ComponentFactory.create(
  {
    type: "divider" as ContentType,
    name: "Divider",
    content: "",
  },
  {
    category: 'decoration',
    accessibility: {
      role: 'separator',
    },
    styling: {
      defaultClasses: 'w-full h-px bg-gray-300',
      supportedVariants: ['solid', 'dashed', 'dotted', 'gradient'],
    },
    permissions: {
      editable: false,
      deletable: true,
      duplicatable: true,
    },
  }
);

export const ResizableColumn = {
  id: uuidv4(),
  type: "resizable-column" as ContentType,
  name: "Text and image",
  className: "border",
  content: [
    {
      id: uuidv4(),
      type: "column" as ContentType,
      name: "Column",
      content: [
        {
          id: uuidv4(),
          type: "paragraph" as ContentType,
          name: "Paragraph",
          content: "",
          placeholder: "Start typing...",
        },
      ],
    },
    {
      id: uuidv4(),
      type: "column" as ContentType,
      name: "Column",
      content: [
        {
          id: uuidv4(),
          type: "paragraph" as ContentType,
          name: "Paragraph",
          content: "",
          placeholder: "Start typing...",
        },
      ],
    },
  ],
  metadata: {
    version: '2.0',
    category: 'layout' as const,
    permissions: {
      editable: true,
      deletable: true,
      duplicatable: true,
    },
  },
};

// ============================================================================
// ADVANCED COMPONENT UTILITIES
// ============================================================================

/**
 * Component registry for dynamic component lookup
 */
export const ComponentRegistry = {
  // Text components
  heading1: Heading1,
  heading2: Heading2,
  heading3: Heading3,
  heading4: Heading4,
  title: Title,
  paragraph: Paragraph,
  blockquote: Blockquote,
  
  // List components
  numberedList: NumberedListComponent,
  bulletList: BulletListComponent,
  todoList: TodoListComponent,
  
  // Media components
  image: CustomImage,
  
  // Data components
  table: Table,
  tableOfContents: TableOfContentsComponent,
  
  // Interactive components
  customButton: CustomButtonComponent,
  
  // Decoration components
  calloutBox: CalloutBoxComponent,
  codeBlock: CodeBlockComponent,
  divider: DividerComponent,
  
  // Layout components
  resizableColumn: ResizableColumn,
} as const;

/**
 * Get component by type with type safety
 */
export function getComponentByType(type: ContentType): any {
  return ComponentRegistry[type as keyof typeof ComponentRegistry];
}

/**
 * Get all components of a specific category
 */
export function getComponentsByCategory(category: ComponentMetadata['category']): any[] {
  return Object.values(ComponentRegistry).filter(
    (component: any) => component.metadata?.category === category
  );
}

/**
 * Create a new instance of a component
 */
export function createComponentInstance(type: ContentType): any {
  const component = getComponentByType(type);
  if (!component) return null;
  return ComponentFactory.clone(component);
}

/**
 * Validate if a component can be edited
 */
export function canEditComponent(component: any): boolean {
  return component?.metadata?.permissions?.editable ?? true;
}

/**
 * Validate if a component can be deleted
 */
export function canDeleteComponent(component: any): boolean {
  return component?.metadata?.permissions?.deletable ?? true;
}

/**
 * Validate if a component can be duplicated
 */
export function canDuplicateComponent(component: any): boolean {
  return component?.metadata?.permissions?.duplicatable ?? true;
}

/**
 * Get component accessibility info
 */
export function getComponentAccessibility(component: any) {
  return component?.metadata?.accessibility;
}

/**
 * Get component styling info
 */
export function getComponentStyling(component: any) {
  return component?.metadata?.styling;
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export {
  ComponentFactory,
  type ComponentMetadata,
  type BaseComponent,
};
