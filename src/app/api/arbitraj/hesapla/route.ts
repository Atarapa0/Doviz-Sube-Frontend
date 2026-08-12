import { NextResponse } from "next/server";

import { BACKEND_API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiServiceError, apiPost } from "@/lib/api-service";
import type {
  ArbitrajHesaplaRequest,
  ArbitrajHesaplaResponse,
} from "@/types/api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ArbitrajHesaplaRequest;
    const data = await apiPost<ArbitrajHesaplaResponse>(
      BACKEND_API_ENDPOINTS.arbitrajHesapla,
      body,
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Arbitraj hesaplama API bağlantı hatası:", error);

    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }

    return NextResponse.json(
      { mesaj: "Arbitraj hesaplama API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
