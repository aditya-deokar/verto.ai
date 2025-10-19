import { v4 as uuidv4 } from "uuid";
import { ContentType } from "./types";

export const BlankCard = {
  slideName: "Blank card",
  type: "blank-card",
  className: "p-8 mx-auto flex justify-center items-center min-h-[200px]",
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
    ],
  },
};

export const AccentLeft = {
  slideName: "Accent left",
  type: "accentLeft",
  className: "min-h-[300px]",
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
            className: "w-full h-full p-8 flex justify-center items-center",
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
  className: "min-h-[300px]",
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
            className: "w-full h-full p-8 flex justify-center items-center",
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
  className: "min-h-[200px] p-8 mx-auto flex justify-center items-center",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Image and text",
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
            className: "w-full h-full p-8 flex justify-center items-center",
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
  className: "min-h-[200px] p-8 mx-auto flex justify-center items-center",
  content: {
    id: uuidv4(),
    type: "column" as ContentType,
    name: "Column",
    content: [
      {
        id: uuidv4(),
        type: "resizable-column" as ContentType,
        name: "Text and image",
        className: "border",
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
            className: "w-full h-full p-8 flex justify-center items-center",
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
                className: "p-3",
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
  className: "p-4 mx-auto flex justify-center items-center",
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
  className: "p-4 mx-auto flex justify-center items-center",
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
  className: "p-4 mx-auto flex justify-center items-center",
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
  className: "p-4 mx-auto flex justify-center items-center",
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
  className: "p-4 mx-auto flex justify-center items-center",
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
  className: "p-4 mx-auto flex justify-center items-center",
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
  className: "p-4 mx-auto flex justify-center items-center",
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
  className: "p-4 mx-auto flex justify-center items-center",
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
  className: "p-8 mx-auto flex flex-col min-h-[400px]",
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
  className: "p-8 mx-auto flex min-h-[400px]",
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
            className: "flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8",
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
  className: "p-8 mx-auto min-h-[400px]",
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
  className: "p-8 mx-auto min-h-[400px]",
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
  className: "p-8 mx-auto min-h-[400px]",
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
  className: "p-12 mx-auto flex items-center justify-center min-h-[400px] bg-gradient-to-br from-primary/10 to-primary/5",
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
  className: "p-8 mx-auto min-h-[400px]",
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