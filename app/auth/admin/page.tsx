'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/admin');
  }, [router]);

  return null;
} 