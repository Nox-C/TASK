import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface ErrorResponse {
  message: string;
}

interface LoginResponse {
  token: string;
  user: any;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Call your authentication service here
    const response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json() as ErrorResponse;
      return NextResponse.json(
        { message: error.message || 'Login failed' },
        { status: response.status }
      );
    }

    const { token, user } = await response.json() as LoginResponse;

    // Set HTTP-only cookie with the token
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
