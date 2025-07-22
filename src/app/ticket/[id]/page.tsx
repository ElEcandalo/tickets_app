'use client';
import { useParams } from 'next/navigation';

export default function TicketPage() {
  const params = useParams();
  return <div>ID: {params?.id}</div>;
}
