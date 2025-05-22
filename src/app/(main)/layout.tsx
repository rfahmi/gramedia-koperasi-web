'use client';

import { ReactNode } from 'react';
import BottomNav from '@/components/layout/BottomNav';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pb-16"> {/* Add padding to account for fixed bottom navigation */}
      {children}
      <BottomNav />
    </div>
  );
}