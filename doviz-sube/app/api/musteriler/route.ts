import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_BASE_URL tanımlı değil." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/musteriler`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: `Müşteri API isteği başarısız: ${response.status}` },
        { status: response.status },
      );
    }

    const data: unknown = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Müşteri API bağlantı hatası:", error);
    return NextResponse.json(
      { message: "Müşteri API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
