import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime/middleware";

// Create Inngest client for mobile design
export const inngest = new Inngest({
    id: "verto-ai-mobile-design",
    middleware: [realtimeMiddleware() as any],
});
