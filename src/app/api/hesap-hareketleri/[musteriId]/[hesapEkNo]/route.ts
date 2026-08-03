import { NextResponse } from "next/server";

import { BACKEND_API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiServiceError, apiGet } from "@/lib/api-service";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ musteriId: string; hesapEkNo: string }>;
  },
) {
  const { musteriId, hesapEkNo } = await params;

  try {
    const data = await apiGet<unknown>(
      BACKEND_API_ENDPOINTS.hesapHareketleri(musteriId, hesapEkNo),
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Hesap hareketleri API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Hesap hareketleri API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
