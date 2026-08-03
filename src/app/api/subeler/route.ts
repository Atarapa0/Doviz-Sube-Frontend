import { NextResponse } from "next/server";

import { BACKEND_API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiServiceError, apiGet, apiPost } from "@/lib/api-service";

export async function GET() {
  try {
    const data = await apiGet<unknown>(BACKEND_API_ENDPOINTS.subeler);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Şube API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Şube API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await apiPost<unknown>(BACKEND_API_ENDPOINTS.subeler, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Şube oluşturma API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Şube oluşturma API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
