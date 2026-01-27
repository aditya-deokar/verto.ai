/**
 * Wraps raw HTML content in a full document with theme styles and messaging scripts
 */
export function getHTMLWrapper(
    html: string,
    title: string,
    themeStyle?: string,
    frameId?: string
): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://cdn.jsdelivr.net/npm/iconify-icon@2.3.0/dist/iconify-icon.min.js"></script>
        <style>
          :root {
            ${themeStyle || ''}
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          /* Mobile bottom nav styles */
          .mobile-bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 0.75rem 1rem;
            background: var(--card, #fff);
            border-top: 1px solid var(--border, #e5e7eb);
            z-index: 50;
          }
          .mobile-bottom-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.75rem;
            color: var(--muted-foreground, #6b7280);
            text-decoration: none;
            position: relative;
          }
          .mobile-bottom-nav-item.active {
            color: var(--primary, #3b82f6);
          }
          .mobile-bottom-nav-item iconify-icon {
            font-size: 1.25rem;
          }
          .nav-indicator {
            position: absolute;
            bottom: -0.5rem;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: transparent;
          }
          .mobile-bottom-nav-item.active .nav-indicator {
            background: var(--primary, #3b82f6);
          }
        </style>
      </head>
      <body>
        ${html}
        <script>
          // Send height to parent for dynamic sizing
          function sendHeight() {
            const height = document.body.scrollHeight;
            window.parent.postMessage({ 
              type: 'FRAME_HEIGHT', 
              height: height,
              frameId: '${frameId || ''}'
            }, '*');
          }
          // Initial send
          sendHeight();
          // Observe for changes
          const observer = new ResizeObserver(sendHeight);
          observer.observe(document.body);
          // Also send on load
          window.addEventListener('load', sendHeight);
        </script>
      </body>
    </html>
  `;
}
