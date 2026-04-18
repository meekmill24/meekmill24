import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Site Maintenance</title>
      <style>
        body {
          margin: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, -apple-system, sans-serif;
          background-color: #f8f9fa;
          color: #333;
        }
        h1 {
          font-size: 2rem;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <h1>Down for maintenance</h1>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 503, // 503 Service Unavailable is the standard SEO-friendly code for maintenance
    headers: { 'Content-Type': 'text/html' },
  });
}

export const config = {
  matcher: '/:path*',
};
