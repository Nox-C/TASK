import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface User {
  id: string;
  email: string;
  name: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    // In a real app, you would validate the token and fetch user data
    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Mock user data for demonstration
    const mockUser: User = {
      id: "123",
      email: "user@example.com",
      name: "Demo User",
    };

    return NextResponse.json(mockUser);
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
