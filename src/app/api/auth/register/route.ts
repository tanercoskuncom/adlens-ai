import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre gerekli" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Şifre en az 6 karakter olmalı" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kayıtlı" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Kullanıcı + Account + Varsayılan Workspace oluştur
    const user = await prisma.user.create({
      data: {
        name: name || email.split("@")[0],
        email,
        accounts: {
          create: {
            type: "credentials",
            provider: "credentials",
            providerAccountId: email,
            access_token: hashedPassword,
          },
        },
        workspaces: {
          create: {
            role: "SUPER_ADMIN",
            workspace: {
              create: {
                name: name ? `${name} Workspace` : "Workspace",
                slug: email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-"),
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Kayıt sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
