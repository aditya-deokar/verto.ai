import { serve } from "inngest/next";
import { inngest } from "@/mobile-design/inngest/client";
import { generateScreens } from "@/mobile-design/inngest/functions/generateScreens";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [generateScreens],
});
