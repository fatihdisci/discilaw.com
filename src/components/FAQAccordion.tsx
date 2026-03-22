import { useState } from 'react';

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
        <div className="max-w-4xl mx-auto mt-12 mb-16">
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="border rounded-lg overflow-hidden backdrop-blur-sm hover:border-gold-500/50 transition-all duration-300"
                        style={{ borderColor: 'var(--border)', background: 'var(--bg-2)' }}
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full px-5 sm:px-6 py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-gold-500/50 group"
                            aria-expanded={openIndex === index}
                            aria-controls={`faq-answer-${index}`}
                        >
                            <span
                                className="text-base sm:text-lg font-semibold group-hover:text-gold-400 transition-colors pr-4"
                                style={{ color: 'var(--text)' }}
                            >
                                {faq.question}
                            </span>
                            <svg
                                className={`w-5 h-5 text-gold-500 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        <div
                            id={`faq-answer-${index}`}
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <div
                                className="px-5 sm:px-6 pb-4 leading-relaxed border-t pt-4"
                                style={{ color: 'var(--text-2)', borderColor: 'var(--border)' }}
                            >
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
