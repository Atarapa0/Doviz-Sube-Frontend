import { NextResponse } from "next/server";
import { ApiServiceError, apiGet, apiPost } from "@/lib/api-service";
import { BACKEND_API_ENDPOINTS } from "@/constants/api-endpoints";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ musteriId: string }> }
) {
  const { musteriId } = await params;

  try {
    const data = await apiGet<unknown>(
      BACKEND_API_ENDPOINTS.musteriHesaplari(musteriId),
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Hesap API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Hesap API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ musteriId: string }> },
) {
  const { musteriId } = await params;

  try {
    const body = await request.json();
    const data = await apiPost<unknown>(
      BACKEND_API_ENDPOINTS.musteriHesaplari(musteriId),
      body,
    );
    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    console.error("Hesap açma API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Hesap açma API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
