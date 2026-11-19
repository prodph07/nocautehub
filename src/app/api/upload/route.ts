import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { isMasterAuthenticated } from "@/lib/auth";
import { CLIENT_SESSION_COOKIE } from "@/lib/client-auth";
import { cookies } from "next/headers";
import {
  isSupabaseConfigured,
  createAdminSupabase,
  createServerSupabase,
} from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const masterAuthed = await isMasterAuthenticated();
  const cookieStore = await cookies();
  const clientCookie = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;
  if (!masterAuthed && !clientCookie?.startsWith("tenant:")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "general").replace(
      /[^a-z0-9-_]/gi,
      ""
    );

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.type === "image/webp" ? "webp" : file.name.split(".").pop() || "webp";
    const fileName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;

    // Se Supabase estiver configurado, envia para o bucket tenant-media
    if (isSupabaseConfigured()) {
      const supabase = createAdminSupabase() ?? (await createServerSupabase());
      if (supabase) {
        const storagePath = `${folder}/${fileName}`;
        const { error } = await supabase.storage
          .from("tenant-media")
          .upload(storagePath, buffer, {
            contentType: file.type || "image/webp",
            upsert: false,
          });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("tenant-media").getPublicUrl(storagePath);

        return NextResponse.json({ url: publicUrl });
      }
    }

    // Modo local: salva em public/uploads/<folder>/<fileName>
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    fs.writeFileSync(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({ url: `/uploads/${folder}/${fileName}` });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json(
      { error: "Erro no upload de mídia" },
      { status: 500 }
    );
  }
}

