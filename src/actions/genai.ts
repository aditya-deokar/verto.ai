'use server'

import { generateObject, generateText} from 'ai'
import { google } from '@ai-sdk/google'
import { currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from "uuid";
import { ContentItem, ContentType, Slide } from '@/lib/types';
import { GeneratedOutputSchema, outlineSchema } from '@/lib/zodSchema';
import { ReferedLayoutsSchema } from '@/lib/zod';




export const generateCreativePrompt=async (userPrompt:string)=>{

    try {
    
    // console.log("🟢 Generating creative prompt...", userPrompt);
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: outlineSchema,
      system:`You are a helpful AI that generates outlines for presentations.`,
      prompt: ` Create a coherent and relevant outline for the following prompt: ${userPrompt}.
                The outline should consist of at least 6 points, with each point written as a single sentence.
                Ensure the outline is well-structured and directly related to the topic. 
                Return the output in the following JSON format:

                {
                    "outlines": [
                    "Point 1",
                    "Point 2",
                    "Point 3",
                    "Point 4",
                    "Point 5",
                    "Point 6"
                    ]
                }

                Ensure that the JSON is valid and properly formatted. Do not include any other text or explanations outside the JSON.
  `
    
    });

    // console.log(object);

    if (object) {
      try {
        return { status: 200, data: object };
      } catch (err) {
        console.error("Invalid JSON received:", object, err);
        return { status: 500, error: "Invalid JSON format received from AI" };
      }
    }

    return { status: 400, error: "No content generated" };
  } catch (error) {
    console.error("🔴 ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
}


export const generateImageUrl = async (prompt: string): Promise<string> => {
  try {
    const improvedPrompt = `
Create a highly realistic, professional image based on the following description. The image should look as if captured in real life, with attention to detail, lighting, and texture.

Description: ${prompt}

Important Notes:
- The image must be in a photorealistic style and visually compelling.
- Ensure all text, signs, or visible writing in the image are in English.
- Pay special attention to lighting, shadows, and textures to make the image as lifelike as possible.
- Avoid elements that appear abstract, cartoonish, or overly artistic. The image should be suitable for professional presentations.
- Focus on accurately depicting the concept described, including specific objects, environment, mood, and context. Maintain relevance to the description provided.

Example Use Cases: Business presentations, educational slides, professional designs.
`;

    const result = await generateText({
      model: google('gemini-2.5-flash'),
      providerOptions: {
        google: { responseModalities: ['TEXT', 'IMAGE'] },
      },
      prompt: improvedPrompt,
    });

    // Find the first image file in the result
    const imageFile = result.files?.find(file => file.mimeType?.startsWith('image/'));

    if (imageFile && imageFile.base64) {
      console.log('🟢 Image generated successfully:', imageFile.base64);
      return imageFile.base64;
    }

    // Fallback if no image found
    return 'https://via.placeholder.com/1024';
  } catch (error) {
    console.error('Failed to generate image:', error);
    return 'https://via.placeholder.com/1024';
  }
};


const findImageComponents = (layout: ContentItem): ContentItem[] => {
  const images = [];
  if (layout.type === "image") {
    images.push(layout);
  }
  if (Array.isArray(layout.content)) {
    layout.content.forEach((child) => {
      images.push(...findImageComponents(child as ContentItem));
    });
  } else if (layout.content && typeof layout.content === "object") {
    images.push(...findImageComponents(layout.content));
  }
  return images;
};

const replaceImagePlaceholders = async (layout: Slide) => {
  const imageComponents = findImageComponents(layout.content);
  console.log("🟢 Found image components:", imageComponents);
  for (const component of imageComponents) {
    console.log("🟢 Generating image for component:", component.alt);
    component.content = await generateImageUrl(
      component.alt || "Placeholder Image"
    );
  }
};





// --- FIX: This function now populates the generated structure with real UUIDs ---
const populateUuids = (element: any) => {
    if (typeof element !== 'object' || element === null) {
        return;
    }
    // Assign a UUID if the element has an 'id' property
    if ('id' in element) {
        element.id = uuidv4();
    }
    // Recurse into nested content if it's an array
    if (Array.isArray(element.content)) {
        element.content.forEach(populateUuids);
    }
    // Recurse into a content object if it exists
    if (typeof element.content === 'object' && element.content !== null) {
        populateUuids(element.content);
    }
};





export const generateLayoutsJSON = async (outlineArray: string[]) => {
  
  // --- FIX: A completely rewritten prompt to teach the AI about your rich components ---
  const prompt = `
    You are an expert presentation designer AI. Your task is to generate a rich, engaging slide deck in JSON format based on the provided outlines.

    Presentation Outlines:
    ${outlineArray.map((outline, index) => `${index + 1}. ${outline}`).join('\n')}

    **CRITICAL JSON Structure Rules:**
    1.  The root output MUST be a valid JSON array of slide objects. Do NOT include any text outside the JSON array.
    2.  For each slide object, you will generate a root "content" object that defines the layout (e.g., a "column").
    3.  **Data Type Rule:** The "content" property's data type depends on the "type":
        - For "column" or "resizable-column", "content" MUST be an array of other content objects.
        - For "title", "heading1", "paragraph", "blockquote", "calloutBox", "content" MUST be a STRING with the text.
        - For "bulletList" or "numberedList", "content" MUST be an ARRAY OF STRINGS.
        - For "image", "content" MUST be a STRING containing a URL.
        - For "codeBlock", "content" MUST be an EMPTY STRING, and the code goes in the "code" property.
    4.  The "name" property should be a short, descriptive name for the component instance (e.g., "Main Title", "Key Features List"). The actual text goes in the "content" property.
    5.  For all "id" fields, use the placeholder string "uuid-placeholder".

    **Example of a Correct Title Slide Structure:**
    {
      "id": "uuid-placeholder",
      "slideName": "Introduction",
      "type": "title-slide",
      "className": "flex flex-col justify-center items-center text-center",
      "content": {
        "id": "uuid-placeholder",
        "type": "column",
        "name": "Title Content",
        "content": [
          {
            "id": "uuid-placeholder",
            "type": "title",
            "name": "Main Title",
            "content": "Langchain: A Framework for Language Model Applications"
          },
          {
            "id": "uuid-placeholder",
            "type": "paragraph",
            "name": "Subtitle",
            "className": "text-xl text-gray-500",
            "content": "Empowering developers to build data-aware and agentic applications."
          }
        ]
      }
    }

    **Example of a Correct Bullet List Slide Structure:**
    {
      "id": "uuid-placeholder",
      "slideName": "Core Components",
      "type": "content-slide",
      "className": "p-8",
      "content": {
        "id": "uuid-placeholder",
        "type": "column",
        "name": "List Content",
        "content": [
          {
            "id": "uuid-placeholder",
            "type": "heading2",
            "name": "Slide Heading",
            "content": "Core Langchain Components"
          },
          {
            "id": "uuid-placeholder",
            "type": "bulletList",
            "name": "Component List",
            "content": ["Models", "Prompts", "Chains", "Indexes"]
          }
        ]
      }
    }

    Now, based on all these rules and the outlines, generate the complete JSON array for the presentation.
  `;

  try {
    console.log("🟢 Generating rich layouts based on outlines...");
    
    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: ReferedLayoutsSchema,
      system: `You are a creative AI assistant that generates presentation slide layouts in valid JSON format based on user-provided outlines and a rich set of component types.`,
      prompt: prompt,
    });

    if (!object) {
      return { status: 400, error: "No content was generated by the AI." };
    }

    object.forEach(populateUuids);

    console.log("🟢 Rich layouts generated successfully 🟢");
    return { status: 200, data: object };

  } catch (error) {
      console.error("🔴 AI Generation ERROR:", error);
      // Add more detailed error logging for Zod validation issues
      if (error instanceof Error && error.message.includes('Validation')) {
          console.error("Zod Validation Error Details:", (error as any).cause);
      }
      return { status: 500, error: "An error occurred during AI content generation." };
  }
}



export const generateLayouts = async (projectId: string, theme: string) => {
    
    try {
        if (!projectId) {
          return { status: 400, error: "Project ID is required" };
        }
        const user = await currentUser();
        if (!user) {
          return { status: 403, error: "User not authenticated" };
        }
    
        const userExist = await prisma.user.findUnique({
          where: { clerkId: user.id },
        });
    
        if (!userExist) {
          return { status: 404, error: "User not found in the database" };
        }
        
        // if (!userExist.subscription) {
        //   return {
        //     status: 403,
        //     error: "User does not have an active subscription",
        //   };
        // }
    
        const project = await prisma.project.findUnique({
          where: { id: projectId, isDeleted: false },
        });
    
        if (!project) {
          return { status: 404, error: "Project not found" };
        }
    
        if (!project.outlines || project.outlines.length === 0) {
          return { status: 400, error: "Project does not have any outlines to generate content from" };
        }
    
        const layouts = await generateLayoutsJSON(project.outlines);
    
        if (layouts.status !== 200 || !layouts.data) {
          return { status: layouts.status, error: layouts.error || "Failed to generate valid layouts" };
        }
    
        await prisma.project.update({
          where: { id: projectId },
          data: { slides: layouts.data as any, themeName: theme },
        });
    
        return { status: 200, data: layouts };
      } catch (error) {
        console.error("🔴 Server Action ERROR:", error);
        return { status: 500, error: "Internal server error" };
      }
};

