import type { ButtonHTMLAttributes } from 'react';

export default function PaginationButton({ className = '', style, disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`px-4 py-2 min-w-[40px] h-10 rounded-lg border font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{
        background: disabled ? 'transparent' : 'var(--bg-2)',
        borderColor: 'var(--border)',
        color: disabled ? 'var(--text-3)' : 'var(--text-2)',
        ...style,
      }}
      disabled={disabled}
      {...props}
    />
  );
}
