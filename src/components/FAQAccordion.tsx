import { useState } from 'react';

/**
 * Minimal inline-markdown to HTML converter for FAQ answers.
 * Supports: **bold**, *italic*, `code`. Everything else is HTML-escaped.
 * No headers, no links, no images — only safe inline formatting.
 */
function renderInlineMd(input: string): string {
    if (!input) return '';
    // 1. Escape HTML
    let html = input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    // 2. **bold** -> <strong>
    html = html.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
    // 3. *italic* -> <em>  (avoid colliding with **)
    html = html.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
    // 4. `code` -> <code>
    html = html.replace(/`([^`\n]+?)`/g, '<code>$1</code>');
    return html;
}

interface FAQ {
    question: string;
    answer: string;
}

interface FAQAccordionProps {
    faqs: FAQ[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 mb-12">
            <div className="space-y-3">
                {faqs.map((faq, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div
                            key={index}
                            className="overflow-hidden transition-all duration-300"
                            style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-soft)',
                                borderRadius: 'var(--radius-lg)',
                            }}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between text-left cursor-pointer"
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    background: 'transparent',
                                    border: 'none',
                                }}
                                aria-expanded={isOpen}
                                aria-controls={`faq-answer-${index}`}
                            >
                                <span
                                    style={{
                                        color: 'var(--ink-strong)',
                                        fontFamily: 'var(--font-display)',
                                        fontWeight: 500,
                                        fontSize: '1.0625rem',
                                        letterSpacing: '-0.015em',
                                        lineHeight: 1.3,
                                        paddingRight: '1rem',
                                    }}
                                >
                                    {faq.question}
                                </span>
                                <svg
                                    className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                    width="18"
                                    height="18"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.75}
                                    style={{ color: 'var(--brand-deep)' }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            <div
                                id={`faq-answer-${index}`}
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div
                                    className="px-5 sm:px-6 pb-5 pt-3"
                                    style={{
                                        color: 'var(--ink-default)',
                                        borderTop: '1px solid var(--border-soft)',
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.65,
                                    }}
                                    dangerouslySetInnerHTML={{ __html: renderInlineMd(faq.answer) }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
