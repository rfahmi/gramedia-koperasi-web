'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BannerItem {
  imageUri: string;
  caption: string;
}

interface SliderBannerProps {
  data: BannerItem[];
}

export default function SliderBanner({ data }: SliderBannerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % data.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [data.length]);

  return (
    <div className="relative rounded-lg overflow-hidden mb-4 h-[100px]">
      {data.map((item, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image 
            src={item.imageUri}
            alt={item.caption}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <p className="text-sm">{item.caption}</p>
          </div>
        </div>
      ))}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1">
        {data.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === activeIndex ? 'bg-white' : 'bg-gray-400'
            }`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}