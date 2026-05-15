import type { ButtonHTMLAttributes } from 'react';

export default function PaginationButton({ className = '', style, disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`px-4 py-2 min-w-[44px] h-10 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${disabled ? '' : 'cursor-pointer'} ${className}`}
      style={{
        background: disabled ? 'transparent' : 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        color: disabled ? 'var(--ink-faint)' : 'var(--ink-default)',
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        fontSize: '0.875rem',
        ...style,
      }}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'var(--brand-soft)';
          e.currentTarget.style.borderColor = 'var(--brand)';
          e.currentTarget.style.color = 'var(--brand-deep)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'var(--bg-elevated)';
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--ink-default)';
        }
      }}
      {...props}
    />
  );
}
