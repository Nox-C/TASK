import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type ErrorResponse = {
  message?: string
}

export async function GET() {
  try {
    const apiUrl = process.env.API_URL ?? 'http://localhost:3001'
    const token = cookies().get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const res = await fetch(`${apiUrl}/auth/me`, {
      method: 'GET',
      headers: {
        // IMPORTANT: include a space after Bearer
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as ErrorResponse
      return NextResponse.json(
        { message: err?.message ?? 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await res.json()
    return NextResponse.json(user)
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
