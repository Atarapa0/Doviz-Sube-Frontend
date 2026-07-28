import { NextResponse } from "next/server";
import { ApiServiceError, apiPost } from "@/lib/api-service";
import { BACKEND_API_ENDPOINTS } from "@/constants/api-endpoints";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await apiPost<unknown>(BACKEND_API_ENDPOINTS.dovizCevir, body);
    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    console.error("Döviz çevirme API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Döviz çevirme API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
