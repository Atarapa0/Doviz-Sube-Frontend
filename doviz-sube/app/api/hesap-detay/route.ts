import { NextResponse } from "next/server";
import { ApiServiceError, apiGet } from "@/lib/api-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const hesapNo = url.searchParams.get("hesapNo");

  if (!hesapNo) {
    return NextResponse.json(
      { message: "Hesap No parametresi gerekli." },
      { status: 400 }
    );
  }

  try {
    const data = await apiGet<unknown>("/api/v1/hesap-detay", { hesapNo });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Hesap detayı API hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Hesap detayı alınamadı." },
      { status: 502 }
    );
  }
}
