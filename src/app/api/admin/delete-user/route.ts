import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { user_id } = await req.json();
  if (!user_id) {
    return NextResponse.json({ success: false, error: 'Falta user_id' }, { status: 400 });
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    return NextResponse.json({ success: false, error: 'Faltan variables de entorno' }, { status: 500 });
  }
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user_id}`, {
      method: 'DELETE',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ success: false, error: error.message || 'Error eliminando usuario de Auth' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Error inesperado en el backend' }, { status: 500 });
  }
} 