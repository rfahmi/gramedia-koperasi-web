'use client';

import { ReactNode } from 'react';

interface ScreenContainerProps {
  children: ReactNode;
}

export default function ScreenContainer({ children }: ScreenContainerProps) {
  return (
    <div className="container-mobile min-h-screen pb-16">
      {children}
    </div>
  );
}