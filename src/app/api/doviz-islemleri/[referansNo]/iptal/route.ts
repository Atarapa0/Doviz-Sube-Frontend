import { NextResponse } from "next/server";

import { BACKEND_API_ENDPOINTS } from "@/constants/api-endpoints";
import { ApiServiceError, apiPost } from "@/lib/api-service";

export async function POST(
  request: Request,
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
    const body: unknown = await request.json();
    const iptalNedeni =
      typeof body === "object" &&
      body !== null &&
      "iptalNedeni" in body &&
      typeof body.iptalNedeni === "string"
        ? body.iptalNedeni.trim()
        : "";

    if (!iptalNedeni) {
      return NextResponse.json(
        { message: "İptal nedeni zorunludur." },
        { status: 400 },
      );
    }

    if (iptalNedeni.length > 500) {
      return NextResponse.json(
        { message: "İptal nedeni en fazla 500 karakter olabilir." },
        { status: 400 },
      );
    }

    const data = await apiPost<unknown>(
      BACKEND_API_ENDPOINTS.dovizIslemIptal(temizReferansNo),
      { iptalNedeni },
    );
    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    console.error("Döviz işlem iptali API bağlantı hatası:", error);
    if (error instanceof ApiServiceError) {
      return NextResponse.json(error.data, { status: error.status });
    }
    return NextResponse.json(
      { message: "Döviz işlem iptali API'sine bağlanılamadı." },
      { status: 502 },
    );
  }
}
