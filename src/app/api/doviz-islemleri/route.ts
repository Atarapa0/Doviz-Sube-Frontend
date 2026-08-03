import { NextResponse } from "next/server";

import { BACKEND_API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiServiceError, apiGet } from "@/lib/api-service";

export async function GET(request: Request) {
  try {
    const subeKodu = new URL(request.url).searchParams.get("subeKodu");
    const data = await apiGet<unknown>(
      BACKEND_API_ENDPOINTS.dovizIslemleri,
      subeKodu ? { subeKodu } : undefined,
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Döviz işlemleri API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Döviz işlemleri API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
