import { NextResponse } from "next/server";
import { ApiServiceError, apiGet } from "@/lib/api-service";

export async function GET() {
  try {
    const data = await apiGet<unknown>("/api/v1/dovizleri-getir");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Döviz API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Döviz API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
