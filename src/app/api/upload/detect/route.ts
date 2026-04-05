import { NextRequest, NextResponse } from "next/server";
import { detectPlatformFromBuffer } from "@/lib/excel/detector";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const platform = detectPlatformFromBuffer(buffer);

    return NextResponse.json({ platform });
  } catch {
    return NextResponse.json({ platform: "UNKNOWN" });
  }
}
