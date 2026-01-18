"use client";

import { useEffect, useRef } from "react";
import { FrameType } from "@/mobile-design/types/project";
import { useCanvas } from "@/mobile-design/context/canvas-context";

interface FramePreviewProps {
  frame: FrameType;
  frameIndex?: number;
}

export function FramePreview({ frame, frameIndex = 0 }: FramePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme } = useCanvas();

  useEffect(() => {
    if (!iframeRef.current || !frame.htmlContent) return;

    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    // Create full HTML document with theme styles
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            :root {
              ${theme?.style || ''}
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          ${frame.htmlContent}
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(fullHTML);
    iframeDoc.close();
  }, [frame.htmlContent, theme]);

  return (
    <div
      id={`frame-preview-${frameIndex}`}
      className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-[14px] border-gray-800"
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />

      <iframe
        ref={iframeRef}
        className="w-[375px] h-[812px] border-0 bg-white"
        title={frame.title}
      />
    </div>
  );
}
