import { v4 as uuidv4 } from "uuid";
import { ContentType } from "./types";

export const BlankCard = {
  slideName: "Blank card",
  type: "blank-card",
  className: "p-8 md:p-12 mx-auto flex justify-center items-center h-full w-full",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Untitled Card",
        className: "text-center",
      },
    ],
  },
};

export const AccentLeft = {
  slideName: "Accent left",
  type: "accentLeft",
  className: "h-full w-full",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    restrictDropTo: true,
    content: [
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Resizable column",
        restrictToDrop: true,
        content: [
          {
            id: uuidv4(),
            type: "image" as ContentType,
            name: "Image",
            content:
              "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            alt: "Title",
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Column",
            content: [
              {
                id: uuidv4(),
                type: "heading1" as ContentType,
                name: "Heading1",
                content: "",
                placeholder: "Your headline goes here",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Paragraph",
                content: "",
                placeholder: "Add your supporting text here to elaborate on the main point",
              },
            ],
            className: "w-full h-full p-8 md:p-12 flex justify-center items-center",
            placeholder: "Heading1",
          },
        ],
      },
    ],
  },
};

export const AccentRight = {
  slideName: "Accent Right",
  type: "accentRight",
  className: "h-full w-full",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Resizable column",
        restrictToDrop: true,
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Column",
            content: [
              {
                id: uuidv4(),
                type: "heading1" as ContentType,
                name: "Heading1",
                content: "",
                placeholder: "Your headline goes here",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Paragraph",
                content: "",
                placeholder: "Add your supporting text here to elaborate on the main point",
              },
            ],
            className: "w-full h-full p-8 md:p-12 flex justify-center items-center",
            placeholder: "Heading1",
          },
          {
            id: uuidv4(),
            type: "image" as ContentType,
            name: "Image",
            restrictToDrop: true,
            content:
              "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            alt: "Title",
          },
        ],
      },
    ],
  },
};

export const ImageAndText = {
  slideName: "Image and text",
  type: "imageAndText",
  className: "h-full w-full p-6 md:p-10 mx-auto flex justify-center items-center",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Image and text",
        className: "gap-4",
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Column",
            content: [
              {
                id: uuidv4(),
                type: "image" as ContentType,
                name: "Image",
                className: "p-2 rounded-xl overflow-hidden",
                content:
                  "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                alt: "Title",
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
                type: "heading1" as ContentType,
                name: "Heading1",
                content: "",
                placeholder: "Heading1",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Paragraph",
                content: "",
                placeholder: "start typing here",
              },
            ],
            className: "w-full h-full p-6 md:p-10 flex justify-center items-center",
            placeholder: "Heading1",
          },
        ],
      },
    ],
  },
};

export const TextAndImage = {
  slideName: "Text and image",
  type: "textAndImage",
  className: "h-full w-full p-6 md:p-10 mx-auto flex justify-center items-center",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Text and image",
        className: "gap-4",
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "",
            content: [
              {
                id: uuidv4(),
                type: "heading1" as ContentType,
                name: "Heading1",
                content: "",
                placeholder: "Heading1",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Paragraph",
                content: "",
                placeholder: "start typing here",
              },
            ],
            className: "w-full h-full p-6 md:p-10 flex justify-center items-center",
            placeholder: "Heading1",
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Column",
            content: [
              {
                id: uuidv4(),
                type: "image" as ContentType,
                name: "Image",
                className: "p-2 rounded-xl overflow-hidden",
                content:
                  "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                alt: "Title",
              },
            ],
          },
        ],
      },
    ],
  },
};

export const TwoColumns = {
  slideName: "Two columns",
  type: "twoColumns",
  className: "p-8 mx-auto flex justify-center items-center h-full w-full",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Untitled Card",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Text and image",
        className: "border",
        content: [
          {
            id: uuidv4(),
            type: "paragraph" as ContentType,
            name: "Paragraph",
            content: "",
            placeholder: "Start typing...",
          },
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
  },
};

export const TwoColumnsWithHeadings = {
  slideName: "Two columns with headings",
  type: "twoColumnsWithHeadings",
  className: "p-8 mx-auto flex justify-center items-center h-full w-full",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Untitled Card",
      },
      {
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
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
      },
    ],
  },
};

export const ThreeColumns = {
  slideName: "Three column",
  type: "threeColumns",
  className: "p-4 mx-auto flex justify-center items-center h-full w-full",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Untitled Card",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Text and image",
        className: "border",
        content: [
          {
            id: uuidv4(),
            type: "paragraph" as ContentType,
            name: "",
            content: "",
            placeholder: "Start typing...",
          },
          {
            id: uuidv4(),
            type: "paragraph" as ContentType,
            name: "",
            content: "",
            placeholder: "Start typing...",
          },
          {
            id: uuidv4(),
            type: "paragraph" as ContentType,
            name: "",
            content: "",
            placeholder: "Start typing...",
          },
        ],
      },
    ],
  },
};

export const ThreeColumnsWithHeadings = {
  slideName: "Three columns with headings",
  type: "threeColumnsWithHeadings",
  className: "p-4 mx-auto flex justify-center items-center h-full w-full",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Untitled Card",
      },
      {
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
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
      },
    ],
  },
};

export const FourColumns = {
  slideName: "Four column",
  type: "fourColumns",
  className: "p-4 mx-auto flex justify-center items-center h-full w-full",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Untitled Card",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Text and image",
        className: "border",
        content: [
          {
            id: uuidv4(),
            type: "paragraph" as ContentType,
            name: "Paragraph",
            content: "",
            placeholder: "Start typing...",
          },
          {
            id: uuidv4(),
            type: "paragraph" as ContentType,
            name: "Paragraph",
            content: "",
            placeholder: "Start typing...",
          },
          {
            id: uuidv4(),
            type: "paragraph" as ContentType,
            name: "Paragraph",
            content: "",
            placeholder: "Start typing...",
          },
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
  },
};

export const TwoImageColumns = {
  slideName: "Two Image Columns",
  type: "twoImageColumns",
  className: "p-4 mx-auto flex justify-center items-center h-full w-full",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Untitled Card",
      },
      {
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
                type: "image" as ContentType,
                name: "Image",
                className: "p-3",
                content:
                  "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                alt: "Title",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
                type: "image" as ContentType,
                name: "Image",
                className: "p-3",
                content:
                  "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                alt: "Title",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
      },
    ],
  },
};

export const ThreeImageColumns = {
  slideName: "Three Image Columns",
  type: "threeImageColumns",
  className: "p-4 mx-auto flex justify-center items-center h-full w-full",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Untitled Card",
      },
      {
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
                type: "image" as ContentType,
                name: "Image",
                className: "p-3",
                content:
                  "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                alt: "Title",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
                type: "image" as ContentType,
                name: "Image",
                className: "p-3",
                content:
                  "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                alt: "Title",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
                type: "image" as ContentType,
                name: "Image",
                className: "p-3",
                content:
                  "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                alt: "Title",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
      },
    ],
  },
};

export const FourImageColumns = {
  slideName: "Four Image Columns",
  type: "fourImageColumns",
  className: "p-4 mx-auto flex justify-center items-center h-full w-full",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Untitled Card",
      },
      {
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
                type: "image" as ContentType,
                name: "Image",
                className: "p-3",
                content:
                  "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                alt: "Title",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
                type: "image" as ContentType,
                name: "Image",
                className: "p-3",
                content:
                  "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                alt: "Title",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
                type: "image" as ContentType,
                name: "Image",
                className: "p-3",
                content:
                  "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                alt: "Title",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
                type: "image" as ContentType,
                name: "Image",
                className: "p-3",
                content:
                  "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                alt: "Title",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Heading 3",
              },
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
      },
    ],
  },
};

export const TableLayout = {
  slideName: "Table Layout",
  type: "tableLayout",
  className:
    "p-8 mx-auto flex flex-col justify-center items-center min-h-[400px]",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "table" as ContentType,
        name: "Table",
        initialRowSizes: 2,
        initialColumnSizes: 2,
        content: [],
      },
    ],
  },
};

// NEW LAYOUTS

export const TitleAndContent = {
  slideName: "Title and Content",
  type: "titleAndContent",
  className: "p-4 md:p-8 mx-auto flex flex-col min-h-[400px]",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Slide Title",
        className: "mb-6",
      },
      {
        id: uuidv4(),
        type: "bulletList" as ContentType,
        name: "Bullet List",
        content: ["Point 1", "Point 2", "Point 3"],
        placeholder: "Add your points here...",
      },
    ],
  },
};

export const SplitContentImage = {
  slideName: "Split Content Image",
  type: "splitContentImage",
  className: "min-h-[400px]",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Resizable column",
        restrictToDrop: true,
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Column",
            content: [
              {
                id: uuidv4(),
                type: "heading2" as ContentType,
                name: "Heading2",
                content: "",
                placeholder: "Section Title",
              },
              {
                id: uuidv4(),
                type: "bulletList" as ContentType,
                name: "Bullet List",
                content: ["Key point 1", "Key point 2", "Key point 3"],
              },
            ],
            className: "w-full h-full p-8",
          },
          {
            id: uuidv4(),
            type: "image" as ContentType,
            name: "Image",
            restrictToDrop: true,
            content: "/placeholder.svg",
            alt: "Content Image",
            className: "w-full h-full object-cover",
          },
        ],
      },
    ],
  },
};

export const BigNumberLayout = {
  slideName: "Big Number Layout",
  type: "bigNumberLayout",
  className: "p-4 md:p-8 mx-auto flex min-h-[400px]",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Resizable column",
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Column",
            className: "flex items-center justify-center bg-linear-to-br from-primary/10 to-primary/5 rounded-lg p-8",
            content: [
              {
                id: uuidv4(),
                type: "title" as ContentType,
                name: "Big Number",
                content: "47%",
                placeholder: "Number",
                className: "text-6xl font-bold text-center",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Column",
            className: "p-4",
            content: [
              {
                id: uuidv4(),
                type: "heading2" as ContentType,
                name: "Heading2",
                content: "",
                placeholder: "Metric Title",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Paragraph",
                content: "",
                placeholder: "Description of what this number represents...",
              },
            ],
          },
        ],
      },
    ],
  },
};

export const ComparisonLayout = {
  slideName: "Comparison Layout",
  type: "comparisonLayout",
  className: "p-4 md:p-8 mx-auto min-h-[400px]",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Comparison Title",
        className: "mb-6 text-center",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Resizable column",
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Column",
            className: "border-2 border-primary/20 rounded-lg p-6 bg-green-50 dark:bg-green-950/20",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Option A",
                className: "text-center text-green-600 dark:text-green-400",
              },
              {
                id: uuidv4(),
                type: "bulletList" as ContentType,
                name: "Bullet List",
                content: ["Feature 1", "Feature 2", "Feature 3"],
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Column",
            className: "border-2 border-primary/20 rounded-lg p-6 bg-blue-50 dark:bg-blue-950/20",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Option B",
                className: "text-center text-blue-600 dark:text-blue-400",
              },
              {
                id: uuidv4(),
                type: "bulletList" as ContentType,
                name: "Bullet List",
                content: ["Feature 1", "Feature 2", "Feature 3"],
              },
            ],
          },
        ],
      },
    ],
  },
};

export const QuoteLayout = {
  slideName: "Quote Layout",
  type: "quoteLayout",
  className: "p-12 mx-auto flex items-center justify-center min-h-[400px]",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    className: "max-w-4xl",
    content: [
      {
        id: uuidv4(),
        type: "blockquote" as ContentType,
        name: "Blockquote",
        content: [
          {
            id: uuidv4(),
            type: "paragraph" as ContentType,
            name: "Quote",
            content: "",
            placeholder: "Enter your inspirational quote here...",
            className: "text-3xl font-medium italic text-center",
          },
        ],
      },
      {
        id: uuidv4(),
        type: "paragraph" as ContentType,
        name: "Author",
        content: "",
        placeholder: "— Author Name",
        className: "text-right text-muted-foreground mt-4",
      },
    ],
  },
};

export const TimelineLayout = {
  slideName: "Timeline Layout",
  type: "timelineLayout",
  className: "p-4 md:p-8 mx-auto min-h-[400px]",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Timeline Title",
        className: "mb-8 text-center",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Resizable column",
        className: "gap-4",
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Step 1",
            className: "border-l-4 border-primary pl-4",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Phase 1",
                className: "text-primary",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Paragraph",
                content: "",
                placeholder: "Description...",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Step 2",
            className: "border-l-4 border-primary/60 pl-4",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Phase 2",
                className: "text-primary",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Paragraph",
                content: "",
                placeholder: "Description...",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Step 3",
            className: "border-l-4 border-primary/30 pl-4",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Heading3",
                content: "",
                placeholder: "Phase 3",
                className: "text-primary",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Paragraph",
                content: "",
                placeholder: "Description...",
              },
            ],
          },
        ],
      },
    ],
  },
};

export const FullImageBackground = {
  slideName: "Full Image Background",
  type: "fullImageBackground",
  className: "relative min-h-[500px]",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "image" as ContentType,
        name: "Background Image",
        content: "/placeholder.svg",
        alt: "Background",
        className: "absolute inset-0 w-full h-full object-cover opacity-30",
      },
      {
        id: uuidv4(),
        type: "column" as ContentType,
        name: "Content",
        className: "relative z-10 p-12 flex flex-col justify-center h-full",
        content: [
          {
            id: uuidv4(),
            type: "title" as ContentType,
            name: "Title",
            content: "",
            placeholder: "Overlay Title",
            className: "text-white drop-shadow-lg",
          },
          {
            id: uuidv4(),
            type: "paragraph" as ContentType,
            name: "Paragraph",
            content: "",
            placeholder: "Your message here...",
            className: "text-white drop-shadow-lg mt-4",
          },
        ],
      },
    ],
  },
};

export const IconGrid = {
  slideName: "Icon Grid",
  type: "iconGrid",
  className: "p-4 md:p-8 mx-auto min-h-[400px]",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Features / Benefits",
        className: "mb-8 text-center",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Grid",
        className: "grid grid-cols-2 gap-6",
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Item 1",
            className: "text-center p-4 rounded-lg border",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Icon/Number",
                content: "✓",
                placeholder: "Icon",
                className: "text-4xl mb-2",
              },
              {
                id: uuidv4(),
                type: "heading4" as ContentType,
                name: "Title",
                content: "",
                placeholder: "Feature Title",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Description",
                content: "",
                placeholder: "Brief description",
                className: "text-sm",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Item 2",
            className: "text-center p-4 rounded-lg border",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Icon/Number",
                content: "★",
                placeholder: "Icon",
                className: "text-4xl mb-2",
              },
              {
                id: uuidv4(),
                type: "heading4" as ContentType,
                name: "Title",
                content: "",
                placeholder: "Feature Title",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Description",
                content: "",
                placeholder: "Brief description",
                className: "text-sm",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Item 3",
            className: "text-center p-4 rounded-lg border",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Icon/Number",
                content: "⚡",
                placeholder: "Icon",
                className: "text-4xl mb-2",
              },
              {
                id: uuidv4(),
                type: "heading4" as ContentType,
                name: "Title",
                content: "",
                placeholder: "Feature Title",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Description",
                content: "",
                placeholder: "Brief description",
                className: "text-sm",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Item 4",
            className: "text-center p-4 rounded-lg border",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Icon/Number",
                content: "🎯",
                placeholder: "Icon",
                className: "text-4xl mb-2",
              },
              {
                id: uuidv4(),
                type: "heading4" as ContentType,
                name: "Title",
                content: "",
                placeholder: "Feature Title",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Description",
                content: "",
                placeholder: "Brief description",
                className: "text-sm",
              },
            ],
          },
        ],
      },
    ],
  },
};

export const SectionDivider = {
  slideName: "Section Divider",
  type: "sectionDivider",
  className: "p-12 mx-auto flex items-center justify-center min-h-[400px] bg-linear-to-br from-primary/10 to-primary/5",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    className: "text-center",
    content: [
      {
        id: uuidv4(),
        type: "heading1" as ContentType,
        name: "Section Number",
        content: "",
        placeholder: "02",
        className: "text-7xl font-bold text-primary/30 mb-4",
      },
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Section Title",
        content: "",
        placeholder: "Section Name",
        className: "text-5xl",
      },
    ],
  },
};

export const ProcessFlow = {
  slideName: "Process Flow",
  type: "processFlow",
  className: "p-4 md:p-8 mx-auto min-h-[400px]",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Process Title",
        className: "mb-8 text-center",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Flow Steps",
        className: "flex items-center gap-2",
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Step 1",
            className: "flex-1 bg-primary/10 rounded-lg p-6 text-center",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Step Number",
                content: "1",
                className: "text-2xl font-bold text-primary mb-2",
              },
              {
                id: uuidv4(),
                type: "heading4" as ContentType,
                name: "Step Title",
                content: "",
                placeholder: "Step Name",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "paragraph" as ContentType,
            name: "Arrow",
            content: "→",
            className: "text-3xl text-primary",
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Step 2",
            className: "flex-1 bg-primary/10 rounded-lg p-6 text-center",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Step Number",
                content: "2",
                className: "text-2xl font-bold text-primary mb-2",
              },
              {
                id: uuidv4(),
                type: "heading4" as ContentType,
                name: "Step Title",
                content: "",
                placeholder: "Step Name",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "paragraph" as ContentType,
            name: "Arrow",
            content: "→",
            className: "text-3xl text-primary",
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Step 3",
            className: "flex-1 bg-primary/10 rounded-lg p-6 text-center",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Step Number",
                content: "3",
                className: "text-2xl font-bold text-primary mb-2",
              },
              {
                id: uuidv4(),
                type: "heading4" as ContentType,
                name: "Step Title",
                content: "",
                placeholder: "Step Name",
              },
            ],
          },
        ],
      },
    ],
  },
};

export const CallToAction = {
  slideName: "Call to Action",
  type: "callToAction",
  className: "p-12 mx-auto flex flex-col items-center justify-center min-h-[400px] text-center",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    className: "max-w-3xl",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Ready to Get Started?",
        className: "mb-4",
      },
      {
        id: uuidv4(),
        type: "paragraph" as ContentType,
        name: "Description",
        content: "",
        placeholder: "Brief description of what action you want them to take...",
        className: "text-xl mb-8 text-muted-foreground",
      },
      {
        id: uuidv4(),
        type: "heading2" as ContentType,
        name: "CTA Button",
        content: "",
        placeholder: "Contact Us →",
        className: "inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold",
      },
    ],
  },
};

export const CreativeHero = {
  slideName: "Creative Hero",
  type: "creativeHero",
  className: "h-full w-full p-8",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Creative Hero",
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Left Column",
            className: "flex flex-col justify-center",
            content: [
              {
                id: uuidv4(),
                type: "heading1" as ContentType,
                name: "Heading1",
                content: "",
                placeholder: "Big Idea",
                className: "text-6xl font-black tracking-tight",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Paragraph",
                content: "",
                placeholder: "Describe the concept...",
                className: "text-xl text-muted-foreground mt-4",
              },
              {
                id: uuidv4(),
                type: "customButton" as ContentType,
                name: "Button",
                content: "Explore More",
                link: "#",
                bgColor: "#000000",
                className: "mt-8 w-fit",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Right Column",
            content: [
              {
                id: uuidv4(),
                type: "image" as ContentType,
                name: "Image",
                content:
                  "https://plus.unsplash.com/premium_photo-1661339265887-be15949790ff?q=80&w=2669&auto=format&fit=crop",
                alt: "Hero Image",
                className: "rounded-3xl object-cover h-full shadow-2xl skew-y-3 hover:skew-y-0 transition-all duration-500",
              },
            ],
          },
        ],
      },
    ],
  },
};

export const BentoGrid = {
  slideName: "Bento Grid",
  type: "bentoGrid",
  className: "h-full w-full p-6",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Main Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Dashboard View",
        className: "mb-6",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Bento Grid Layout",
        content: [
          // Column 1: Tall Card
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Col 1",
            content: [
              {
                id: uuidv4(),
                type: "image" as ContentType,
                name: "Image",
                content: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?q=80&w=2574&auto=format&fit=crop",
                className: "h-full object-cover rounded-2xl",
              },
            ],
            className: "h-full bg-muted/20 rounded-3xl border border-border/50 p-2",
          },
          // Column 2: Stacked
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Col 2",
            className: "flex flex-col gap-4",
            content: [
              {
                id: uuidv4(),
                type: "statBox" as ContentType,
                name: "Stat Box",
                content: "12.5k",
                className: "flex-1",
              },
              {
                id: uuidv4(),
                type: "statBox" as ContentType,
                name: "Stat Box",
                content: "98%",
                className: "flex-1",
              },
            ]
          },
          // Column 3: Text content
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Col 3",
            className: "bg-primary/5 rounded-3xl p-6 flex flex-col justify-center",
            content: [
              {
                id: uuidv4(),
                type: "heading2" as ContentType,
                name: "Heading",
                content: "",
                placeholder: "Key Insights",
              },
              {
                id: uuidv4(),
                type: "bulletList" as ContentType,
                name: "List",
                content: ["Metric A exceeded targets", "Growth in region B", "Efficiency up by 15%"],
              },
            ],
          }
        ],
      },
    ],
  },
};

export const StatsRow = {
  slideName: "Stats Row",
  type: "statsRow",
  className: "h-full w-full p-8 flex flex-col justify-center",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "heading2" as ContentType,
        name: "Section Title",
        content: "",
        placeholder: "Performance Metrics",
        className: "text-center mb-12",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Stats Grid",
        content: [
          {
            id: uuidv4(),
            type: "statBox" as ContentType,
            name: "Stat 1",
            content: "10M+",
          },
          {
            id: uuidv4(),
            type: "statBox" as ContentType,
            name: "Stat 2",
            content: "4.9/5",
          },
          {
            id: uuidv4(),
            type: "statBox" as ContentType,
            name: "Stat 3",
            content: "150+",
          },
        ],
      },
    ],
  },
};

export const VisualTimelineLayout = {
  slideName: "Timeline",
  type: "timeline",
  className: "h-full w-full p-8",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Main",
    content: [
      {
        id: uuidv4(),
        type: "heading2" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Project Roadmap",
        className: "mb-8 text-center",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Timeline Grid",
        content: [
          {
            id: uuidv4(),
            type: "timelineCard" as ContentType,
            name: "Q1",
            content: "Phase 1",
          },
          {
            id: uuidv4(),
            type: "timelineCard" as ContentType,
            name: "Q2",
            content: "Phase 2",
          },
          {
            id: uuidv4(),
            type: "timelineCard" as ContentType,
            name: "Q3",
            content: "Phase 3",
          },
        ],
      },
    ],
  },
};

// ============================================================================
// PREMIUM LAYOUTS
// ============================================================================

export const GradientHero = {
  slideName: "Gradient Hero",
  type: "gradientHero",
  className: "h-full w-full flex items-center justify-center p-12 text-center",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    className: "max-w-4xl flex flex-col items-center justify-center",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Make Something Amazing",
        className: "text-center mb-4",
      },
      {
        id: uuidv4(),
        type: "paragraph" as ContentType,
        name: "Subtitle",
        content: "",
        placeholder: "A compelling subtitle that describes your vision and inspires your audience to take action",
        className: "text-center opacity-80 mb-8",
      },
      {
        id: uuidv4(),
        type: "customButton" as ContentType,
        name: "CTA Button",
        content: "Get Started →",
        link: "#",
        bgColor: "#000000",
        className: "mt-2",
      },
    ],
  },
};

export const TeamGrid = {
  slideName: "Team Grid",
  type: "teamGrid",
  className: "h-full w-full p-8",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Meet Our Team",
        className: "text-center mb-8",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Team Members",
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Member 1",
            className: "flex flex-col items-center text-center p-4 gap-3",
            content: [
              {
                id: uuidv4(),
                type: "image" as ContentType,
                name: "Avatar",
                content: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
                alt: "Team Member",
                className: "w-24 h-24 rounded-full object-cover mx-auto",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Name",
                content: "",
                placeholder: "John Doe",
                className: "text-center",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Role",
                content: "",
                placeholder: "CEO & Founder",
                className: "text-center opacity-70",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Member 2",
            className: "flex flex-col items-center text-center p-4 gap-3",
            content: [
              {
                id: uuidv4(),
                type: "image" as ContentType,
                name: "Avatar",
                content: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
                alt: "Team Member",
                className: "w-24 h-24 rounded-full object-cover mx-auto",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Name",
                content: "",
                placeholder: "Jane Smith",
                className: "text-center",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Role",
                content: "",
                placeholder: "Head of Design",
                className: "text-center opacity-70",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Member 3",
            className: "flex flex-col items-center text-center p-4 gap-3",
            content: [
              {
                id: uuidv4(),
                type: "image" as ContentType,
                name: "Avatar",
                content: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
                alt: "Team Member",
                className: "w-24 h-24 rounded-full object-cover mx-auto",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Name",
                content: "",
                placeholder: "Alex Chen",
                className: "text-center",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Role",
                content: "",
                placeholder: "Lead Engineer",
                className: "text-center opacity-70",
              },
            ],
          },
        ],
      },
    ],
  },
};

export const MetricDashboard = {
  slideName: "Metric Dashboard",
  type: "metricDashboard",
  className: "h-full w-full p-8 flex flex-col justify-center",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "heading2" as ContentType,
        name: "Section Title",
        content: "",
        placeholder: "Key Performance Indicators",
        className: "text-center mb-4",
      },
      {
        id: uuidv4(),
        type: "paragraph" as ContentType,
        name: "Description",
        content: "",
        placeholder: "A summary of our most important metrics this quarter",
        className: "text-center opacity-70 mb-12",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Metrics Grid",
        content: [
          {
            id: uuidv4(),
            type: "statBox" as ContentType,
            name: "Stat 1",
            content: "2.4M",
          },
          {
            id: uuidv4(),
            type: "statBox" as ContentType,
            name: "Stat 2",
            content: "99.9%",
          },
          {
            id: uuidv4(),
            type: "statBox" as ContentType,
            name: "Stat 3",
            content: "$12M",
          },
          {
            id: uuidv4(),
            type: "statBox" as ContentType,
            name: "Stat 4",
            content: "4.8★",
          },
        ],
      },
    ],
  },
};

export const TestimonialSlide = {
  slideName: "Testimonial",
  type: "testimonialSlide",
  className: "h-full w-full p-12 flex items-center justify-center",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    className: "max-w-4xl flex flex-col items-center",
    content: [
      {
        id: uuidv4(),
        type: "blockquote" as ContentType,
        name: "Blockquote",
        content: "",
        placeholder: "This product completely transformed the way we work. The results speak for themselves — 3x productivity increase in just two months.",
        className: "text-2xl text-center mb-8",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Author Info",
        restrictToDrop: true,
        content: [
          {
            id: uuidv4(),
            type: "image" as ContentType,
            name: "Avatar",
            content: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
            alt: "Author",
            className: "w-16 h-16 rounded-full object-cover",
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Details",
            className: "flex flex-col justify-center pl-4",
            content: [
              {
                id: uuidv4(),
                type: "heading4" as ContentType,
                name: "Author Name",
                content: "",
                placeholder: "Sarah Johnson",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Author Title",
                content: "",
                placeholder: "VP of Operations, TechCorp",
                className: "opacity-70",
              },
            ],
          },
        ],
      },
    ],
  },
};

export const FeatureShowcase = {
  slideName: "Feature Showcase",
  type: "featureShowcase",
  className: "h-full w-full p-8",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Why Choose Us",
        className: "text-center mb-2",
      },
      {
        id: uuidv4(),
        type: "paragraph" as ContentType,
        name: "Subtitle",
        content: "",
        placeholder: "Everything you need to succeed, all in one place",
        className: "text-center opacity-70 mb-10",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Features Row 1",
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Feature 1",
            className: "p-6 rounded-xl border border-border/30 flex flex-col gap-2",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Icon",
                content: "⚡",
                className: "text-4xl mb-2",
              },
              {
                id: uuidv4(),
                type: "heading4" as ContentType,
                name: "Title",
                content: "",
                placeholder: "Lightning Fast",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Description",
                content: "",
                placeholder: "Built for speed with optimized performance at every level",
                className: "opacity-70 text-sm",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Feature 2",
            className: "p-6 rounded-xl border border-border/30 flex flex-col gap-2",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Icon",
                content: "🔒",
                className: "text-4xl mb-2",
              },
              {
                id: uuidv4(),
                type: "heading4" as ContentType,
                name: "Title",
                content: "",
                placeholder: "Enterprise Security",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Description",
                content: "",
                placeholder: "Bank-grade encryption and SOC 2 compliance built in",
                className: "opacity-70 text-sm",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Feature 3",
            className: "p-6 rounded-xl border border-border/30 flex flex-col gap-2",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Icon",
                content: "🎯",
                className: "text-4xl mb-2",
              },
              {
                id: uuidv4(),
                type: "heading4" as ContentType,
                name: "Title",
                content: "",
                placeholder: "Precision Analytics",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Description",
                content: "",
                placeholder: "Deep insights and real-time dashboards for data-driven decisions",
                className: "opacity-70 text-sm",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Feature 4",
            className: "p-6 rounded-xl border border-border/30 flex flex-col gap-2",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Icon",
                content: "🤝",
                className: "text-4xl mb-2",
              },
              {
                id: uuidv4(),
                type: "heading4" as ContentType,
                name: "Title",
                content: "",
                placeholder: "Team Collaboration",
              },
              {
                id: uuidv4(),
                type: "paragraph" as ContentType,
                name: "Description",
                content: "",
                placeholder: "Real-time collaboration tools that bring your team together",
                className: "opacity-70 text-sm",
              },
            ],
          },
        ],
      },
    ],
  },
};

export const AgendaSlide = {
  slideName: "Agenda",
  type: "agendaSlide",
  className: "h-full w-full p-8 md:p-12",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Today's Agenda",
        className: "mb-10",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Agenda Items",
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Items Left",
            className: "flex flex-col gap-6 pr-4",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Item 1",
                content: "",
                placeholder: "01  ·  Introduction & Overview",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Item 2",
                content: "",
                placeholder: "02  ·  Market Analysis",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Item 3",
                content: "",
                placeholder: "03  ·  Product Strategy",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Items Right",
            className: "flex flex-col gap-6 pl-4",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Item 4",
                content: "",
                placeholder: "04  ·  Financial Projections",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Item 5",
                content: "",
                placeholder: "05  ·  Roadmap & Milestones",
              },
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Item 6",
                content: "",
                placeholder: "06  ·  Q&A Session",
              },
            ],
          },
        ],
      },
    ],
  },
};

export const ThankYouSlide = {
  slideName: "Thank You",
  type: "thankYouSlide",
  className: "h-full w-full flex items-center justify-center p-12 text-center",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    className: "max-w-3xl flex flex-col items-center justify-center gap-4",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Thank You",
        className: "text-center mb-2",
      },
      {
        id: uuidv4(),
        type: "paragraph" as ContentType,
        name: "Message",
        content: "",
        placeholder: "We appreciate your time and attention. Let's build something amazing together.",
        className: "text-center opacity-80 mb-6",
      },
      {
        id: uuidv4(),
        type: "divider" as ContentType,
        name: "Divider",
        content: "",
        className: "mb-4",
      },
      {
        id: uuidv4(),
        type: "heading3" as ContentType,
        name: "Contact",
        content: "",
        placeholder: "hello@company.com  ·  company.com",
        className: "text-center opacity-60",
      },
    ],
  },
};

export const PricingTable = {
  slideName: "Pricing Table",
  type: "pricingTable",
  className: "h-full w-full p-8",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "title" as ContentType,
        name: "Title",
        content: "",
        placeholder: "Simple, Transparent Pricing",
        className: "text-center mb-2",
      },
      {
        id: uuidv4(),
        type: "paragraph" as ContentType,
        name: "Subtitle",
        content: "",
        placeholder: "Choose the plan that works best for your team",
        className: "text-center opacity-70 mb-10",
      },
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Plans",
        content: [
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Starter",
            className: "p-6 rounded-2xl border border-border/30 flex flex-col gap-4",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Plan Name",
                content: "",
                placeholder: "Starter",
              },
              {
                id: uuidv4(),
                type: "heading1" as ContentType,
                name: "Price",
                content: "",
                placeholder: "$9/mo",
              },
              {
                id: uuidv4(),
                type: "bulletList" as ContentType,
                name: "Features",
                content: ["5 projects", "Basic analytics", "Email support"],
              },
              {
                id: uuidv4(),
                type: "customButton" as ContentType,
                name: "CTA",
                content: "Start Free",
                link: "#",
                bgColor: "transparent",
                isTransparent: true,
                className: "mt-auto",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Professional",
            className: "p-6 rounded-2xl border-2 border-primary/40 flex flex-col gap-4 bg-primary/5 scale-105",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Plan Name",
                content: "",
                placeholder: "Professional ⭐",
              },
              {
                id: uuidv4(),
                type: "heading1" as ContentType,
                name: "Price",
                content: "",
                placeholder: "$29/mo",
              },
              {
                id: uuidv4(),
                type: "bulletList" as ContentType,
                name: "Features",
                content: ["Unlimited projects", "Advanced analytics", "Priority support", "API access"],
              },
              {
                id: uuidv4(),
                type: "customButton" as ContentType,
                name: "CTA",
                content: "Get Started",
                link: "#",
                bgColor: "#3b82f6",
                className: "mt-auto",
              },
            ],
          },
          {
            id: uuidv4(),
            type: "column" as ContentType,
            name: "Enterprise",
            className: "p-6 rounded-2xl border border-border/30 flex flex-col gap-4",
            content: [
              {
                id: uuidv4(),
                type: "heading3" as ContentType,
                name: "Plan Name",
                content: "",
                placeholder: "Enterprise",
              },
              {
                id: uuidv4(),
                type: "heading1" as ContentType,
                name: "Price",
                content: "",
                placeholder: "Custom",
              },
              {
                id: uuidv4(),
                type: "bulletList" as ContentType,
                name: "Features",
                content: ["Everything in Pro", "Custom integrations", "Dedicated manager", "SLA guarantee"],
              },
              {
                id: uuidv4(),
                type: "customButton" as ContentType,
                name: "CTA",
                content: "Contact Sales",
                link: "#",
                bgColor: "transparent",
                isTransparent: true,
                className: "mt-auto",
              },
            ],
          },
        ],
      },
    ],
  },
};