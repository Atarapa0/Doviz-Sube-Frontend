import { NextResponse } from "next/server";

import { BACKEND_API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiServiceError, apiGet } from "@/lib/api-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subeKodu: string }> },
) {
  const { subeKodu } = await params;
  const temizSubeKodu = subeKodu.trim();

  if (!temizSubeKodu) {
    return NextResponse.json(
      { message: "Şube kodu zorunludur." },
      { status: 400 },
    );
  }

  try {
    const data = await apiGet<unknown>(
      BACKEND_API_ENDPOINTS.subeDetayi(temizSubeKodu),
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Şube detayı API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Şube detayı API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
