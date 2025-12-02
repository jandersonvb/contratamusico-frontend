import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where = category ? { category } : {};

    const faqs = await prisma.fAQItem.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Erro ao buscar FAQs:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar FAQs" },
      { status: 500 }
    );
  }
}

