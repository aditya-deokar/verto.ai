// const referedLayouts = [
//   {
//     id: uuidv4(),
//     slideName: "Blank card",
//     type: "blank-card",
//     className: "p-8 mx-auto flex justify-center items-center min-h-[200px]",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "title" as ContentType,
//           name: "Title",
//           content: "",
//           placeholder: "Untitled Card",
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Accent left",
//     type: "accentLeft",
//     className: "min-h-[300px]",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       restrictDropTo: true,
//       content: [
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Resizable column",
//           restrictToDrop: true,
//           content: [
//             {
//               id: uuidv4(),
//               type: "image" as ContentType,
//               name: "Image",
//               content:
//                 "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//               alt: "Title",
//             },
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "heading1" as ContentType,
//                   name: "Heading1",
//                   content: "",
//                   placeholder: "Heading1",
//                 },
//                 {
//                   id: uuidv4(),
//                   type: "paragraph" as ContentType,
//                   name: "Paragraph",
//                   content: "",
//                   placeholder: "start typing here",
//                 },
//               ],
//               className: "w-full h-full p-8 flex justify-center items-center",
//               placeholder: "Heading1",
//             },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Accent Right",
//     type: "accentRight",
//     className: "min-h-[300px]",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Resizable column",
//           restrictToDrop: true,
//           content: [
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "heading1" as ContentType,
//                   name: "Heading1",
//                   content: "",
//                   placeholder: "Heading1",
//                 },
//                 {
//                   id: uuidv4(),
//                   type: "paragraph" as ContentType,
//                   name: "Paragraph",
//                   content: "",
//                   placeholder: "start typing here",
//                 },
//               ],
//               className: "w-full h-full p-8 flex justify-center items-center",
//               placeholder: "Heading1",
//             },
//             {
//               id: uuidv4(),
//               type: "image" as ContentType,
//               name: "Image",
//               restrictToDrop: true,
//               content:
//                 "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//               alt: "Title",
//             },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Image and text",
//     type: "imageAndText",
//     className: "min-h-[200px] p-8 mx-auto flex justify-center items-center",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Image and text",
//           className: "border",
//           content: [
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "image" as ContentType,
//                   name: "Image",
//                   className: "p-3",
//                   content:
//                     "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//                   alt: "Title",
//                 },
//               ],
//             },
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "heading1" as ContentType,
//                   name: "Heading1",
//                   content: "",
//                   placeholder: "Heading1",
//                 },
//                 {
//                   id: uuidv4(),
//                   type: "paragraph" as ContentType,
//                   name: "Paragraph",
//                   content: "",
//                   placeholder: "start typing here",
//                 },
//               ],
//               className: "w-full h-full p-8 flex justify-center items-center",
//               placeholder: "Heading1",
//             },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Text and image",
//     type: "textAndImage",
//     className: "min-h-[200px] p-8 mx-auto flex justify-center items-center",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Text and image",
//           className: "border",
//           content: [
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "heading1" as ContentType,
//                   name: "Heading1",
//                   content: "",
//                   placeholder: "Heading1",
//                 },
//                 {
//                   id: uuidv4(),
//                   type: "paragraph" as ContentType,
//                   name: "Paragraph",
//                   content: "",
//                   placeholder: "start typing here",
//                 },
//               ],
//               className: "w-full h-full p-8 flex justify-center items-center",
//               placeholder: "Heading1",
//             },
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "image" as ContentType,
//                   name: "Image",
//                   className: "p-3",
//                   content:
//                     "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//                   alt: "Title",
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Two columns",
//     type: "twoColumns",
//     className: "p-4 mx-auto flex justify-center items-center",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "title" as ContentType,
//           name: "Title",
//           content: "",
//           placeholder: "Untitled Card",
//         },
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Text and image",
//           className: "border",
//           content: [
//             {
//               id: uuidv4(),
//               type: "paragraph" as ContentType,
//               name: "Paragraph",
//               content: "",
//               placeholder: "Start typing...",
//             },
//             {
//               id: uuidv4(),
//               type: "paragraph" as ContentType,
//               name: "Paragraph",
//               content: "",
//               placeholder: "Start typing...",
//             },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Two columns with headings",
//     type: "twoColumnsWithHeadings",
//     className: "p-4 mx-auto flex justify-center items-center",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "title" as ContentType,
//           name: "Title",
//           content: "",
//           placeholder: "Untitled Card",
//         },
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Text and image",
//           className: "border",
//           content: [
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "heading3" as ContentType,
//                   name: "Heading3",
//                   content: "",
//                   placeholder: "Heading 3",
//                 },
//                 {
//                   id: uuidv4(),
//                   type: "paragraph" as ContentType,
//                   name: "Paragraph",
//                   content: "",
//                   placeholder: "Start typing...",
//                 },
//               ],
//             },
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "heading3" as ContentType,
//                   name: "Heading3",
//                   content: "",
//                   placeholder: "Heading 3",
//                 },
//                 {
//                   id: uuidv4(),
//                   type: "paragraph" as ContentType,
//                   name: "Paragraph",
//                   content: "",
//                   placeholder: "Start typing...",
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Three column",
//     type: "threeColumns",
//     className: "p-4 mx-auto flex justify-center items-center",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "title" as ContentType,
//           name: "Title",
//           content: "",
//           placeholder: "Untitled Card",
//         },
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Text and image",
//           className: "border",
//           content: [
//             {
//               id: uuidv4(),
//               type: "paragraph" as ContentType,
//               name: "",
//               content: "",
//               placeholder: "Start typing...",
//             },
//             {
//               id: uuidv4(),
//               type: "paragraph" as ContentType,
//               name: "",
//               content: "",
//               placeholder: "Start typing...",
//             },
//             {
//               id: uuidv4(),
//               type: "paragraph" as ContentType,
//               name: "",
//               content: "",
//               placeholder: "Start typing...",
//             },
//           ],
//         },
//       ],
//     },
//   },
// ];

// const prompt = `### Guidelines
// You are a highly creative AI that generates JSON-based layouts for presentations. I will provide you with a pattern and a format to follow, and for each outline, you must generate unique layouts and contents and give me the output in the JSON format expected.
// Our final JSON output is a combination of layouts and elements. The available LAYOUTS TYPES are as follows: "accentLeft", "accentRight", "imageAndText", "textAndImage", "twoColumns", "twoColumnsWithHeadings", "threeColumns", "threeColumnsWithHeadings", "fourColumns", "twoImageColumns", "threeImageColumns", "fourImageColumns", "tableLayout".
// The available CONTENT TYPES are "heading1", "heading2", "heading3", "heading4", "title", "paragraph", "table", "resizable-column", "image", "blockquote", "numberedList", "bulletList", "todoList", "calloutBox", "codeBlock", "tableOfContents", "divider", "column"

// Use these outlines as a starting point for the content of the presentations
//   ${JSON.stringify(outlineArray)}

// The output must be an array of JSON objects.
//   1. Write layouts based on the specific outline provided. Do not use types that are not mentioned in the example layouts.
//   2. Ensuring each layout is unique.
//   3. Adhere to the structure of existing layouts
//   4. Fill placeholder data into content fields where required.
//   5. Generate unique image placeholders for the 'content' property of image components and also alt text according to the outline.
//   6. Ensure proper formatting and schema alignment for the output JSON.
// 7. First create LAYOUTS TYPES  at the top most level of the JSON output as follows ${JSON.stringify(
//     [
//       {
//         slideName: "Blank card",
//         type: "blank-card",
//         className: "p-8 mx-auto flex justify-center items-center min-h-[200px]",
//         content: {},
//       },
//     ]
//   )}

// 8.The content property of each LAYOUTS TYPE should start with “column” and within the columns content property you can use any  of the CONTENT TYPES I provided above. Resizable-column, column and other multi element contents should be an array because you can have more elements inside them nested. Static elements like title and paragraph should have content set to a string.Here is an example of what 1 layout with 1 column with 1 title inside would look like:
// ${JSON.stringify([
//   {
//     slideName: "Blank card",
//     type: "blank-card",
//     className: "p-8 mx-auto flex justify-center items-center min-h-[200px]",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "title" as ContentType,
//           name: "Title",
//           content: "",
//           placeholder: "Untitled Card",
//         },
//       ],
//     },
//   },
// ])}

// 9. Here is a final example of an example output for you to get an idea
// ${JSON.stringify([
//   {
//     id: uuidv4(),
//     slideName: "Blank card",
//     type: "blank-card",
//     className: "p-8 mx-auto flex justify-center items-center min-h-[200px]",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "title" as ContentType,
//           name: "Title",
//           content: "",
//           placeholder: "Untitled Card",
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Accent left",
//     type: "accentLeft",
//     className: "min-h-[300px]",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       restrictDropTo: true,
//       content: [
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Resizable column",
//           restrictToDrop: true,
//           content: [
//             {
//               id: uuidv4(),
//               type: "image" as ContentType,
//               name: "Image",
//               content:
//                 "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//               alt: "Title",
//             },
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "heading1" as ContentType,
//                   name: "Heading1",
//                   content: "",
//                   placeholder: "Heading1",
//                 },
//                 {
//                   id: uuidv4(),
//                   type: "paragraph" as ContentType,
//                   name: "Paragraph",
//                   content: "",
//                   placeholder: "start typing here",
//                 },
//               ],
//               className: "w-full h-full p-8 flex justify-center items-center",
//               placeholder: "Heading1",
//             },
//           ],
//         },
//       ],
//     },
//   },
// ])}

//  For Images
//   - The alt text should describe the image clearly and concisely.
//   - Focus on the main subject(s) of the image and any relevant details such as colors, shapes, people, or objects.
//   - Ensure the alt text aligns with the context of the presentation slide it will be used on (e.g., professional, educational, business-related).
//   - Avoid using terms like "image of" or "picture of," and instead focus directly on the content and meaning.

//   Output the layouts in JSON format. Ensure there are no duplicate layouts across the array.`;

//   const prompt = `
//     I will provide you with an array of outlines, and for each outline, you must generate a unique and creative layout. Use the existing layouts as examples for structure and design, and generate unique designs based on the provided outline.

//     ### Guidelines:
//     1. Write layouts based on the specific outline provided. Do not use types that are not mentioned in the example layouts.
//     2. Use diverse and engaging designs, ensuring each layout is unique.
//     3. Adhere to the structure of existing layouts but add new styles or components if needed.
//     4. Fill placeholder data into content fields where required.
//     5. Generate unique image placeholders for the 'content' property of image components and also alt text according to the outline.
//     6. Ensure proper formatting and schema alignment for the output JSON.

//     ### Example Layouts:
//     ${JSON.stringify(referedLayouts, null, 2)}

//     ### Outline Array:
//     ${JSON.stringify(outlineArray)}

//     For each entry in the outline array, generate:
//     - A unique JSON layout with creative designs.
//     - Properly filled content, including placeholders for image components.
//     - Clear and well-structured JSON data.
//     For Images
//     - The alt text should describe the image clearly and concisely.
//     - Focus on the main subject(s) of the image and any relevant details such as colors, shapes, people, or objects.
//     - Ensure the alt text aligns with the context of the presentation slide it will be used on (e.g., professional, educational, business-related).
//     - Avoid using terms like "image of" or "picture of," and instead focus directly on the content and meaning.

//     Output the layouts in JSON format. Ensure there are no duplicate layouts across the array.
// `

// export const generateLayoutsJSON =async (outlineArray: string[])=>{

// const prompt = `You are a JSON layout generator.
// Generate an array of slide layouts with the following exact structure.
// Always return **valid JSON only** without explanation or extra text.

// Rules:
// - The root output must be: const referedLayouts = [ ... ];
// - Each layout must include:
//   - id: uuidv4()
//   - slideName: string
//   - type: string
//   - className: string
//   - content: {
//       id: uuidv4(),
//       type: "column" | "resizable-column" | "title" | "heading1" | "heading3" | "paragraph" | "image",
//       name: string,
//       content: [] (nested items),
//       placeholder?: string,
//       className?: string,
//       alt?: string
//     }
// - Use nested content arrays to build the structure.
// - Always use "as ContentType" type casting for type values.
// - Use Unsplash URLs for default image content.
// - Do not add explanations or comments.

// Output example (format your result exactly like this):

// const referedLayouts = [
//   {
//     id: uuidv4(),
//     slideName: "Blank card",
//     type: "blank-card",
//     className: "p-8 mx-auto flex justify-center items-center min-h-[200px]",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "title" as ContentType,
//           name: "Title",
//           content: "",
//           placeholder: "Untitled Card",
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Accent left",
//     type: "accentLeft",
//     className: "min-h-[300px]",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       restrictDropTo: true,
//       content: [
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Resizable column",
//           restrictToDrop: true,
//           content: [
//             {
//               id: uuidv4(),
//               type: "image" as ContentType,
//               name: "Image",
//               content:
//                 "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//               alt: "Title",
//             },
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "heading1" as ContentType,
//                   name: "Heading1",
//                   content: "",
//                   placeholder: "Heading1",
//                 },
//                 {
//                   id: uuidv4(),
//                   type: "paragraph" as ContentType,
//                   name: "Paragraph",
//                   content: "",
//                   placeholder: "start typing here",
//                 },
//               ],
//               className: "w-full h-full p-8 flex justify-center items-center",
//               placeholder: "Heading1",
//             },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Accent Right",
//     type: "accentRight",
//     className: "min-h-[300px]",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Resizable column",
//           restrictToDrop: true,
//           content: [
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "heading1" as ContentType,
//                   name: "Heading1",
//                   content: "",
//                   placeholder: "Heading1",
//                 },
//                 {
//                   id: uuidv4(),
//                   type: "paragraph" as ContentType,
//                   name: "Paragraph",
//                   content: "",
//                   placeholder: "start typing here",
//                 },
//               ],
//               className: "w-full h-full p-8 flex justify-center items-center",
//               placeholder: "Heading1",
//             },
//             {
//               id: uuidv4(),
//               type: "image" as ContentType,
//               name: "Image",
//               restrictToDrop: true,
//               content:
//                 "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//               alt: "Title",
//             },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Image and text",
//     type: "imageAndText",
//     className: "min-h-[200px] p-8 mx-auto flex justify-center items-center",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Image and text",
//           className: "border",
//           content: [
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "image" as ContentType,
//                   name: "Image",
//                   className: "p-3",
//                   content:
//                     "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//                   alt: "Title",
//                 },
//               ],
//             },
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "heading1" as ContentType,
//                   name: "Heading1",
//                   content: "",
//                   placeholder: "Heading1",
//                 },
//                 {
//                   id: uuidv4(),
//                   type: "paragraph" as ContentType,
//                   name: "Paragraph",
//                   content: "",
//                   placeholder: "start typing here",
//                 },
//               ],
//               className: "w-full h-full p-8 flex justify-center items-center",
//               placeholder: "Heading1",
//             },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Text and image",
//     type: "textAndImage",
//     className: "min-h-[200px] p-8 mx-auto flex justify-center items-center",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Text and image",
//           className: "border",
//           content: [
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "heading1" as ContentType,
//                   name: "Heading1",
//                   content: "",
//                   placeholder: "Heading1",
//                 },
//                 {
//                   id: uuidv4(),
//                   type: "paragraph" as ContentType,
//                   name: "Paragraph",
//                   content: "",
//                   placeholder: "start typing here",
//                 },
//               ],
//               className: "w-full h-full p-8 flex justify-center items-center",
//               placeholder: "Heading1",
//             },
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "image" as ContentType,
//                   name: "Image",
//                   className: "p-3",
//                   content:
//                     "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//                   alt: "Title",
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Two columns",
//     type: "twoColumns",
//     className: "p-4 mx-auto flex justify-center items-center",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "title" as ContentType,
//           name: "Title",
//           content: "",
//           placeholder: "Untitled Card",
//         },
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Text and image",
//           className: "border",
//           content: [
//             {
//               id: uuidv4(),
//               type: "paragraph" as ContentType,
//               name: "Paragraph",
//               content: "",
//               placeholder: "Start typing...",
//             },
//             {
//               id: uuidv4(),
//               type: "paragraph" as ContentType,
//               name: "Paragraph",
//               content: "",
//               placeholder: "Start typing...",
//             },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Two columns with headings",
//     type: "twoColumnsWithHeadings",
//     className: "p-4 mx-auto flex justify-center items-center",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "title" as ContentType,
//           name: "Title",
//           content: "",
//           placeholder: "Untitled Card",
//         },
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Text and image",
//           className: "border",
//           content: [
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "heading3" as ContentType,
//                   name: "Heading3",
//                   content: "",
//                   placeholder: "Heading 3",
//                 },
//                 {
//                   id: uuidv4(),
//                   type: "paragraph" as ContentType,
//                   name: "Paragraph",
//                   content: "",
//                   placeholder: "Start typing...",
//                 },
//               ],
//             },
//             {
//               id: uuidv4(),
//               type: "column" as ContentType,
//               name: "Column",
//               content: [
//                 {
//                   id: uuidv4(),
//                   type: "heading3" as ContentType,
//                   name: "Heading3",
//                   content: "",
//                   placeholder: "Heading 3",
//                 },
//                 {
//                   id: uuidv4(),
//                   type: "paragraph" as ContentType,
//                   name: "Paragraph",
//                   content: "",
//                   placeholder: "Start typing...",
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     },
//   },

//   {
//     id: uuidv4(),
//     slideName: "Three column",
//     type: "threeColumns",
//     className: "p-4 mx-auto flex justify-center items-center",
//     content: {
//       id: uuidv4(),
//       type: "column" as ContentType,
//       name: "Column",
//       content: [
//         {
//           id: uuidv4(),
//           type: "title" as ContentType,
//           name: "Title",
//           content: "",
//           placeholder: "Untitled Card",
//         },
//         {
//           id: uuidv4(),
//           type: "resizable-column" as ContentType,
//           name: "Text and image",
//           className: "border",
//           content: [
//             {
//               id: uuidv4(),
//               type: "paragraph" as ContentType,
//               name: "",
//               content: "",
//               placeholder: "Start typing...",
//             },
//             {
//               id: uuidv4(),
//               type: "paragraph" as ContentType,
//               name: "",
//               content: "",
//               placeholder: "Start typing...",
//             },
//             {
//               id: uuidv4(),
//               type: "paragraph" as ContentType,
//               name: "",
//               content: "",
//               placeholder: "Start typing...",
//             },
//           ],
//         },
//       ],
//     },
//   },
// ];
// `
//   try {

//   console.log("🟢 Generating Layout 🟢");
//    const { object } = await generateObject({
//       model: google("gemini-2.5-flash", {
//         structuredOutputs: false,
//       }),
//       schema: ReferedLayoutsSchema,
//       system:`You are a highly creative AI that generates JSON-based layouts for presentations.`,
//       prompt: prompt

//     });

//     if (!object) {
//       return { status: 400, error: "No content generated" };
//     }

//     // await Promise.all(object.map(replaceImagePlaceholders));

//     console.log("🟢 Layouts Generated successfully 🟢");
//     return { status: 200, data: object };

//   } catch (error) {
//       console.error("🔴 ERROR:", error);
//       return { status: 500, error: "Internal server error" };
//   }

// }

// export const generateLayouts = async (projectId: string, theme: string) => {
//   try {
//     if (!projectId) {
//       return { status: 400, error: "Project ID is required" };
//     }
//     const user = await currentUser();
//     if (!user) {
//       return { status: 403, error: "User not authenticated" };
//     }

//     const userExist = await prisma.user.findUnique({
//       where: { clerkId: user.id },
//     });

//     if (!userExist || !userExist.subscription) {
//       return {
//         status: 403,
//         error: !userExist?.subscription
//           ? "User does not have an active subscription"
//           : "User not found in the database",
//       };
//     }

//     const project = await prisma.project.findUnique({
//       where: { id: projectId, isDeleted: false },
//     });

//     if (!project) {
//       return { status: 404, error: "Project not found" };
//     }

//     if (!project.outlines || project.outlines.length === 0) {
//       return { status: 400, error: "Project does not have any outlines" };
//     }

//     const layouts = await generateLayoutsJSON(project.outlines);

//     if (layouts.status !== 200) {
//       return layouts;
//     }

//     await prisma.project.update({
//       where: { id: projectId },
//       data: { slides: layouts, themeName: theme },
//     });

//     return { status: 200, data: layouts };
//   } catch (error) {
//     console.error("🔴 ERROR:", error);
//     return { status: 500, error: "Internal server error", data: [] };
//   }
// };

// export const generateLayoutsJSON = async (outlineArray: string[]) => {
//   // --- FIX: A completely rewritten prompt that requests valid JSON and uses the presentation outlines ---
//   const prompt = `
//     You are an expert presentation layout designer. Based on the following presentation outlines, generate an array of slide layouts in valid JSON format.

//     Presentation Outlines:
//     ${outlineArray.map((outline, index) => `${index + 1}. ${outline}`).join('\n')}

//     Rules for JSON generation:
//     1.  The root of the output MUST be a valid JSON array of slide objects.
//     2.  Each object in the array represents a slide.
//     3.  Generate content (titles, headings, paragraphs) that is relevant to the provided outlines.
//     4.  Use a variety of slide types to make the presentation engaging.
//     5.  For all "id" fields, use the placeholder string "uuid-placeholder".
//     6.  For "image" content, use a relevant Unsplash URL.
//     7.  Do NOT include any explanations, comments, or any text outside of the main JSON array.

//     Here is an example of a single slide object structure:
//     {
//       "id": "uuid-placeholder",
//       "slideName": "Title Slide",
//       "type": "title-slide",
//       "className": "p-8 mx-auto flex flex-col justify-center items-center min-h-[300px]",
//       "content": {
//         "id": "uuid-placeholder",
//         "type": "column",
//         "name": "Main Content",
//         "content": [
//           {
//             "id": "uuid-placeholder",
//             "type": "title",
//             "name": "Title",
//             "content": "The Main Title of the Presentation",
//             "placeholder": "Presentation Title"
//           },
//           {
//             "id": "uuid-placeholder",
//             "type": "paragraph",
//             "name": "Subtitle",
//             "content": "A brief and engaging subtitle.",
//             "placeholder": "Subtitle"
//           }
//         ]
//       }
//     }
//   `;

//   try {
//     console.log("🟢 Generating Layouts based on outlines...");

//     const { object } = await generateObject({
//       model: google("gemini-1.5-flash"), // No need for structuredOutputs: false here
//       schema: ReferedLayoutsSchema,
//       system: `You are a creative AI assistant that generates presentation slide layouts in JSON format based on user-provided outlines.`,
//       prompt: prompt,
//     });

//     if (!object) {
//       return { status: 400, error: "No content was generated by the AI." };
//     }

//     // --- FIX: After generation, loop through the object and replace placeholders with real UUIDs ---
//     object.forEach(populateUuids);

//     console.log("🟢 Layouts Generated and UUIDs populated successfully 🟢");
//     return { status: 200, data: object };

//   } catch (error) {
//       console.error("🔴 AI Generation ERROR:", error);
//       return { status: 500, error: "An error occurred during AI content generation." };
//   }
// }

// export const generateLayouts = async (projectId: string, theme: string) => {
//   try {
//     if (!projectId) {
//       return { status: 400, error: "Project ID is required" };
//     }
//     const user = await currentUser();
//     if (!user) {
//       return { status: 403, error: "User not authenticated" };
//     }

//     const userExist = await prisma.user.findUnique({
//       where: { clerkId: user.id },
//     });

//     if (!userExist) {
//       return { status: 404, error: "User not found in the database" };
//     }

//     // Note: Subscription check logic is kept as is.
//     // if (!userExist.subscription) {
//     //   return {
//     //     status: 403,
//     //     error: "User does not have an active subscription",
//     //   };
//     // }

//     const project = await prisma.project.findUnique({
//       where: { id: projectId, isDeleted: false },
//     });

//     if (!project) {
//       return { status: 404, error: "Project not found" };
//     }

//     if (!project.outlines || project.outlines.length === 0) {
//       return { status: 400, error: "Project does not have any outlines to generate content from" };
//     }

//     const layouts = await generateLayoutsJSON(project.outlines);

//     if (layouts.status !== 200 || !layouts.data) {
//       return { status: layouts.status, error: layouts.error || "Failed to generate valid layouts" };
//     }

//     await prisma.project.update({
//       where: { id: projectId },
//       // --- FIX: Store only the array of slides (layouts.data), not the entire status object. ---
//       // The data is now a JSON object which Prisma handles correctly.
//       data: { slides: layouts.data as any, themeName: theme },
//     });

//     return { status: 200, data: layouts };
//   } catch (error) {
//     console.error("🔴 Server Action ERROR:", error);
//     return { status: 500, error: "Internal server error" };
//   }
// };

[
  {
    id: "db2ecd64-7a1e-4d26-aa0e-7ca521cde105",
    type: "title-slide",
    content: {
      id: "0c64e707-6311-4478-bc0c-4f36302cfc51",
      name: "Title Content",
      type: "column",
      content: [
        "What if you could speak the language of innovation?",
        "Let's explore Python!",
        "Unlock the Power of Programming",
      ],
    },
    className:
      "flex flex-col justify-center items-center text-center min-h-screen p-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white",
    slideName: "Title Slide - Python Innovation",
  },
  {
    id: "de275e05-0d15-4afc-8d68-282a11c77bcf",
    type: "content-slide",
    content: {
      id: "ce9c22d9-cee3-4e52-bbf0-2f0bebf6010d",
      name: "Text Column",
      type: "heading1",
      content: "Python: The Universal Language",
      className: "flex flex-col justify-center gap-6 p-8",
      initialRows: 2,
      initialColumns: 2,
    },
    className: "p-12 bg-white text-gray-800",
    slideName: "Introduction to Python",
  },
  {
    id: "aba764c6-ebd2-422c-975d-fd0aa1ab2e30",
    type: "content-slide",
    content: {
      id: "c0733536-0f1e-4222-ae4f-1ed3fd836964",
      name: "Philosophy Content",
      type: "heading1",
      content: "Simplicity and Readability: Python's Heart",
      className:
        "flex flex-col gap-6 text-center items-center max-w-4xl mx-auto",
    },
    className: "p-12 bg-gray-50",
    slideName: "Python's Core Philosophy",
  },
  {
    id: "d36e66c3-b0d9-405c-b001-b631d4c205cf",
    type: "content-slide",
    content: {
      id: "3a456303-5e1b-4830-9e9a-5dca9e6147b3",
      name: "Code Example Layout",
      type: "heading1",
      content: "Your First Python Code: Hello, World!",
      className: "flex flex-col gap-6 items-center",
    },
    className: "p-12 bg-gray-900 text-white",
    slideName: "Hello, World! Example",
  },
  {
    id: "beb6f249-d1bb-4016-adbe-c09dd7dee901",
    type: "content-slide",
    content: {
      id: "f4ae1b07-85c4-4ae0-aeca-2e09b6860602",
      name: "Left Column - Data Types List",
      type: "heading1",
      content: "Fundamental Data Types",
      className: "flex flex-col gap-4 p-6",
    },
    className: "p-12 bg-white",
    slideName: "Python Data Types",
  },
  {
    id: "acd4703c-cf18-465f-ac7a-96e568860271",
    type: "content-slide",
    content: {
      id: "e06ab6cc-8a03-4d20-af84-3cbea3acd3a6",
      name: "Data Structures Container",
      type: "heading1",
      content: "Organizing Data: Python's Structures",
      className: "flex flex-col gap-8",
    },
    className: "p-12 bg-blue-50 text-gray-900",
    slideName: "Python Data Structures",
  },
  {
    id: "9f105777-dcde-460f-baa0-d9fa5aadcfba",
    type: "content-slide",
    content: {
      id: "0a937708-3770-4675-8dba-6b8e2c2a4dd1",
      name: "Left Column - Control Flow Explanation",
      type: "heading1",
      content: "Control Flow: Guiding Your Code's Logic",
      className: "flex flex-col gap-4 p-6",
    },
    className: "p-12 bg-white",
    slideName: "Control Flow",
  },
  {
    id: "032aa335-199d-4aee-bdf2-0b7600db2147",
    type: "content-slide",
    content: {
      id: "3eaadcb9-d2f7-4816-9008-f08ebb20886f",
      name: "Functions Layout",
      type: "heading1",
      content: "Functions: Reusability and Organization",
      className: "flex flex-col gap-6",
    },
    className: "p-12 bg-gray-100",
    slideName: "Functions in Python",
  },
  {
    id: "cefffbe9-7e2c-4a26-8ead-81db5dc09ad3",
    type: "content-slide",
    content: {
      id: "80ef51d7-6360-4a73-be38-af4152063dc4",
      name: "Popularity Chart",
      type: "heading1",
      content: "The Rise of Python: A Global Standard",
      className: "flex flex-col gap-6 items-center",
    },
    className: "p-12 bg-white text-center",
    slideName: "Python's Popularity",
  },
  {
    id: "b91139dc-4ed5-42dd-bb67-88dd08336b98",
    type: "content-slide",
    content: {
      id: "20ea853c-ef29-4169-aa71-e580b2dd482a",
      name: "Applications Container",
      type: "heading1",
      content: "Where Python Shines: Real-World Applications",
      className: "flex flex-col gap-8",
    },
    className: "p-12 bg-blue-600 text-white",
    slideName: "Real-World Python Applications",
  },
  {
    id: "1c52cc1d-8043-4f16-aed1-c15d01749eb3",
    type: "content-slide",
    content: {
      id: "0fe0e470-421c-421c-ba45-6e4f631821ca",
      name: "Left Column - Data Analysis Code",
      type: "heading1",
      content: "Data Science Powerhouse: Pandas & NumPy",
      className: "flex flex-col gap-4 p-6",
    },
    className: "p-12 bg-white",
    slideName: "Data Analysis with Python",
  },
  {
    id: "8deb3de4-1c2f-4117-ae6e-570297c62b09",
    type: "content-slide",
    content: {
      id: "0d1b9d57-cf5d-48d0-ba9e-30817b623925",
      name: "Ecosystem Container",
      type: "heading1",
      content: "A Thriving Ecosystem of Libraries",
      className: "flex flex-col gap-8",
    },
    className: "p-12 bg-gray-900 text-white",
    slideName: "The Python Ecosystem",
  },
  {
    id: "d75fd3cb-fc48-4352-8b2b-74a36ea22e2a",
    type: "content-slide",
    content: {
      id: "218e5baf-e62d-4bf5-9c68-90fb968f9c8a",
      name: "Left Column - Community Benefits",
      type: "heading1",
      content: "The Power of Community",
      className: "flex flex-col justify-center gap-6 p-8",
    },
    className: "p-12 bg-white",
    slideName: "The Python Community",
  },
  {
    id: "1075bf37-9ab4-42a9-9da2-e43fa4367d93",
    type: "content-slide",
    content: {
      id: "27077c1b-888c-4de5-9d31-7fb345e6ad19",
      name: "Left Column - Challenges",
      type: "heading1",
      content: "Navigating the Learning Curve",
      className: "flex flex-col gap-6 p-8",
    },
    className: "p-12 bg-red-50",
    slideName: "Challenges & Solutions",
  },
  {
    id: "a3cf1184-94d4-470d-9829-043b63f431b6",
    type: "content-slide",
    content: {
      id: "5ddcc5d2-9463-4940-9747-4a7d00fd4278",
      name: "Conclusion Content",
      type: "heading1",
      content: "Embrace Python: Your Journey Begins Now!",
      className: "flex flex-col gap-8 items-center max-w-3xl mx-auto",
    },
    className:
      "flex flex-col justify-center items-center text-center min-h-screen p-12 bg-gradient-to-br from-green-500 to-teal-600 text-white",
    slideName: "Conclusion and CTA",
  },
];
