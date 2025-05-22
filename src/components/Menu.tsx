'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  href?: string;
}

interface MenuProps {
  data: MenuItem[];
}

export default function Menu({ data }: MenuProps) {
  // Material icons equivalent mapping
  const getIconComponent = (iconName: string): ReactNode => {
    switch (iconName) {
      case 'credit-card-plus':
        return (
          <span className="material-icons text-blue-500">credit_card_plus</span>
        );
      case 'credit-card-refund':
        return (
          <span className="material-icons text-green-500">credit_card_alt</span>
        );
      case 'eye-refresh':
        return <span className="material-icons text-purple-500">visibility</span>;
      case 'check-decagram':
        return <span className="material-icons text-amber-500">verified</span>;
      case 'clipboard-list':
        return <span className="material-icons text-teal-500">assignment</span>;
      default:
        return <span className="material-icons">menu</span>;
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {data.map((item, index) => (
        <Link
          key={index}
          href={item.href || '#'}
          className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm"
          onClick={() => item.onPress()}
        >
          <div className="flex justify-center items-center h-12 w-12 rounded-full bg-gray-100 mb-2">
            {getIconComponent(item.icon)}
          </div>
          <span className="text-xs text-center">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}