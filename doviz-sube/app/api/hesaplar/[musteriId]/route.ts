import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ musteriId: string }> }
) {
  const { musteriId } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_BASE_URL tanımlı değil." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/musteriler/${musteriId}/hesaplar`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { message: `Hesap API isteği başarısız: ${response.status}` },
        { status: response.status },
      );
    }

    const data: unknown = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Hesap API bağlantı hatası:", error);
    return NextResponse.json(
      { message: "Hesap API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
