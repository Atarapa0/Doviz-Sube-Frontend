import { NextResponse } from "next/server";
import { ApiServiceError, apiGet, apiPost } from "@/lib/api-service";
import { BACKEND_API_ENDPOINTS } from "@/constants/api-endpoints";

export async function GET() {
  try {
    const data = await apiGet<unknown>(BACKEND_API_ENDPOINTS.musteriler);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Müşteri API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Müşteri API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await apiPost<unknown>(BACKEND_API_ENDPOINTS.musteriler, body);
    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    console.error("Müşteri oluşturma API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Müşteri oluşturma API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
