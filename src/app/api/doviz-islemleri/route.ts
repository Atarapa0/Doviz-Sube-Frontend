import { NextResponse } from "next/server";

import { BACKEND_API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiServiceError, apiGet } from "@/lib/api-service";

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    const subeKodu = searchParams.get("subeKodu")?.trim();

    if (
      (page !== null && (!/^\d+$/.test(page) || Number(page) < 1)) ||
      (pageSize !== null && (!/^\d+$/.test(pageSize) || Number(pageSize) < 1))
    ) {
      return NextResponse.json(
        { message: "page ve pageSize pozitif tam sayı olmalıdır." },
        { status: 400 },
      );
    }

    const query: Record<string, string | number> = {};
    if (page !== null) query.page = Number(page);
    if (pageSize !== null) query.pageSize = Number(pageSize);
    if (subeKodu) query.subeKodu = subeKodu;

    const data = await apiGet<unknown>(
      BACKEND_API_ENDPOINTS.dovizIslemleri,
      Object.keys(query).length > 0 ? query : undefined,
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
