import { NextResponse } from "next/server";

import { BACKEND_API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiServiceError, apiGet } from "@/lib/api-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ musteriId: string }> },
) {
  const { musteriId } = await params;

  if (!/^\d+$/.test(musteriId) || Number(musteriId) < 1) {
    return NextResponse.json(
      { message: "Müşteri ID pozitif tam sayı olmalıdır." },
      { status: 400 },
    );
  }

  try {
    const data = await apiGet<unknown>(
      BACKEND_API_ENDPOINTS.musteriTumHesapHareketleri(musteriId),
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Toplu hesap hareketleri API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Toplu hesap hareketleri API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
