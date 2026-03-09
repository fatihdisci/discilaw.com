import type { ButtonHTMLAttributes } from 'react';

export default function PaginationButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`min-w-[40px] h-10 rounded-lg border font-medium transition-all ${className}`} {...props} />;
}
