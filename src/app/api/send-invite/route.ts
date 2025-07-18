import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // Verificar que la API key esté configurada
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ API key de Resend no configurada');
      return NextResponse.json({ error: 'API key de Resend no configurada' }, { status: 500 });
    }

    console.log('✅ API key de Resend encontrada');

    const { to, nombreInvitado, obra, fecha, lugar, qrCodes } = await req.json();
    // qrCodes: array de objetos { imageUrl: string, link: string }

    if (!to || !nombreInvitado || !obra || !fecha || !lugar || !qrCodes) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Construir HTML del email
    const qrHtml = qrCodes.map((qr: { imageUrl?: string; link: string }, idx: number) =>
      qr.imageUrl
        ? `<div style="margin-bottom:16px;"><img src="${qr.imageUrl}" alt="QR Ticket #${idx + 1}" style="width:180px;display:block;margin:auto;" /><div style="text-align:center;font-size:12px;color:#555;">Ticket #${idx + 1}</div></div>`
        : `<div style="margin-bottom:16px;"><a href="${qr.link}">Ver QR Ticket #${idx + 1}</a></div>`
    ).join('');

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2>¡Hola ${nombreInvitado}!</h2>
        <p>Te invitamos a la obra <b>${obra}</b>.</p>
        <p><b>Fecha:</b> ${fecha}<br/><b>Lugar:</b> ${lugar}</p>
        <p>Adjuntamos tu(s) código(s) QR para el ingreso. Mostralos en la entrada, ¡y listo!</p>
        ${qrHtml}
        <p style="margin-top:32px;">¡Nos vemos en el teatro!<br/>El equipo de El Escándalo</p>
      </div>
    `;

    console.log('📧 Enviando email con Resend...');
    console.log('- From: El Escándalo <onboarding@resend.dev>');
    console.log('- To:', to);
    console.log('- Subject:', `Tu invitación para ${obra}`);

    const { data, error } = await resend.emails.send({
      from: 'El Escándalo <onboarding@resend.dev>',
      to,
      subject: `Tu invitación para ${obra}`,
      html,
    });

    if (error) {
      console.error('❌ Error de Resend:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Email enviado exitosamente');
    return NextResponse.json({ success: true, data });
      } catch (err: unknown) {
      console.error('❌ Error inesperado en send-invite:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado';
      console.error('❌ Mensaje de error:', errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
} 