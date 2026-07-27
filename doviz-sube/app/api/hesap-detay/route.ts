import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = new URL(request.url);
  const hesapNo = url.searchParams.get("hesapNo");

  if (!apiUrl) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_BASE_URL tanımlı değil." },
      { status: 500 }
    );
  }

  if (!hesapNo) {
    return NextResponse.json(
      { message: "Hesap No parametresi gerekli." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${apiUrl}/api/v1/hesap-detay?hesapNo=${hesapNo}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { message: `Hesap detayı API isteği başarısız: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Hesap detayı API hatası:", error);
    return NextResponse.json(
      { message: "Hesap detayı alınamadı." },
      { status: 500 }
    );
  }
}
