'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(0);

  // Navigation items with their routes and icons
  const navItems = [
    { label: 'Home', icon: 'home', route: '/' },
    { label: 'Simpanan', icon: 'account_balance', route: '/simpanan' },
    { label: 'Pinjaman', icon: 'credit_card', route: '/pinjaman' },
    { label: 'Profile', icon: 'person', route: '/profile' },
  ];

  // Update the selected value when the pathname changes
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => 
      item.route === '/' ? pathname === '/' : pathname.startsWith(item.route)
    );
    
    if (currentIndex !== -1) {
      setValue(currentIndex);
    }
  }, [pathname]);

  const handleChange = (_, newValue: number) => {
    setValue(newValue);
    router.push(navItems[newValue].route);
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 10
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleChange}
      >
        {navItems.map((item, index) => (
          <BottomNavigationAction 
            key={index}
            label={item.label} 
            icon={<span className="material-icons">{item.icon}</span>} 
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}