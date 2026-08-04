import { NextResponse } from "next/server";

import { BACKEND_API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiServiceError, apiGet } from "@/lib/api-service";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const q = searchParams.get("q")?.trim() ?? "";
    const limitValue = searchParams.get("limit");

    if (!q) {
      return NextResponse.json(
        { message: "Arama değeri (q) zorunludur." },
        { status: 400 },
      );
    }

    if (
      limitValue !== null &&
      (!/^\d+$/.test(limitValue) || Number(limitValue) < 1)
    ) {
      return NextResponse.json(
        { message: "limit pozitif tam sayı olmalıdır." },
        { status: 400 },
      );
    }

    const data = await apiGet<unknown>(BACKEND_API_ENDPOINTS.musteriAra, {
      q,
      ...(limitValue === null ? {} : { limit: Number(limitValue) }),
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Müşteri arama API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Müşteri arama API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
