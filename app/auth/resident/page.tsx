'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResidentAuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/resident');
  }, [router]);

  return null;
} 