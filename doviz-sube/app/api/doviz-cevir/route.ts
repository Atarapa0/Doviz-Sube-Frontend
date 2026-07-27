import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_BASE_URL tanımlı değil." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(`${apiUrl}/api/v1/doviz-cevir`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const responseText = await response.text();
    let data: unknown = null;

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        data ?? { message: `Döviz çevirme API isteği başarısız: ${response.status}` },
        { status: response.status },
      );
    }

    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    console.error("Döviz çevirme API bağlantı hatası:", error);
    return NextResponse.json(
      { message: "Döviz çevirme API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
