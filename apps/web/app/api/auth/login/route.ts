import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type LoginResponse = {
  token: string
  user: unknown
}

type ErrorResponse = {
  message?: string
}

export async function POST(request: Request) {
  try {
    const apiUrl = process.env.API_URL ?? 'http://localhost:3001'
    const { email, password } = await request.json()

    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as ErrorResponse
      return NextResponse.json(
        { message: err?.message ?? 'Login failed' },
        { status: res.status }
      )
    }

    const data = (await res.json()) as LoginResponse

    // Set HTTP-only cookie
    cookies().set('auth_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return NextResponse.json(data.user)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
