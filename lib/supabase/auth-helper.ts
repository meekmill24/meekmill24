import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Simple passthrough middleware
  // Authentication checks are handled in page layouts for better compatibility
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
}
