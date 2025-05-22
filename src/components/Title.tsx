'use client';

interface TitleProps {
  text: string;
}

export default function Title({ text }: TitleProps) {
  return <h2 className="text-lg font-bold mb-3">{text}</h2>;
}