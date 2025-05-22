'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/configs/redux/store';
import BottomNav from '@/components/layout/BottomNav';

export default function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.authenticated);

  useEffect(() => {
    // Check if user is authenticated, if not redirect to login
    if (!isAuthenticated) {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, router]);

  return (
    <div className="pb-16"> {/* Add padding to account for fixed bottom navigation */}
      {children}
      <BottomNav />
    </div>
  );
}