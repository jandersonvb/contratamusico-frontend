import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, subject, message } = body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
      },
    });

    return NextResponse.json(
      { message: "Mensagem enviada com sucesso", id: contactMessage.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao salvar mensagem de contato:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar mensagem" },
      { status: 500 }
    );
  }
}

