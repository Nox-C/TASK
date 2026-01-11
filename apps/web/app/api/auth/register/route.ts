import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type RegisterResponse = {
  token: string
  user: unknown
}

type ErrorResponse = {
  message?: string
}

export async function POST(request: Request) {
  try {
    const apiUrl = process.env.API_URL ?? 'http://localhost:3001'
    const { email, password, name } = await request.json()

    const res = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as ErrorResponse
      return NextResponse.json(
        { message: err?.message ?? 'Registration failed' },
        { status: res.status }
      )
    }

    const data = (await res.json()) as RegisterResponse

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('auth_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return NextResponse.json(data.user, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
