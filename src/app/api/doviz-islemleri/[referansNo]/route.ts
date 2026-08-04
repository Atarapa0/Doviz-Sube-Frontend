import { NextResponse } from "next/server";

import { BACKEND_API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiServiceError, apiGet } from "@/lib/api-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ referansNo: string }> },
) {
  const { referansNo } = await params;
  const temizReferansNo = referansNo.trim();

  if (!temizReferansNo) {
    return NextResponse.json(
      { message: "Referans numarası zorunludur." },
      { status: 400 },
    );
  }

  try {
    const data = await apiGet<unknown>(
      BACKEND_API_ENDPOINTS.dovizIslemDetayi(temizReferansNo),
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Döviz işlem detayı API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Döviz işlem detayı API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
