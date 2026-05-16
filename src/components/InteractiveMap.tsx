"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, X } from 'lucide-react';

// Abstract map SVG paths representing roads/streets — Soft Sage palette
const AbstractMapSVG = () => (
    <svg
        viewBox="0 0 400 300"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
    >
        <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="rgba(122, 135, 88, 0.10)"
                    strokeWidth="0.5"
                />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Main roads */}
        <path
            d="M 0 150 Q 100 150 200 100 T 400 120"
            fill="none"
            stroke="rgba(122, 135, 88, 0.42)"
            strokeWidth="3"
            strokeLinecap="round"
        />
        <path
            d="M 50 0 Q 50 75 100 150 T 150 300"
            fill="none"
            stroke="rgba(122, 135, 88, 0.32)"
            strokeWidth="2.5"
            strokeLinecap="round"
        />
        <path
            d="M 250 0 Q 280 100 320 150 T 380 300"
            fill="none"
            stroke="rgba(122, 135, 88, 0.36)"
            strokeWidth="2"
            strokeLinecap="round"
        />

        {/* Secondary streets */}
        <path
            d="M 0 80 L 120 80 Q 140 80 140 100 L 140 200"
            fill="none"
            stroke="rgba(184, 191, 170, 0.55)"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <path
            d="M 200 0 L 200 80 Q 200 100 220 100 L 400 100"
            fill="none"
            stroke="rgba(184, 191, 170, 0.45)"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <path
            d="M 300 180 L 300 300"
            fill="none"
            stroke="rgba(184, 191, 170, 0.35)"
            strokeWidth="1"
            strokeLinecap="round"
        />
        <path
            d="M 0 220 L 200 220"
            fill="none"
            stroke="rgba(184, 191, 170, 0.35)"
            strokeWidth="1"
            strokeLinecap="round"
        />

        {/* Location marker — terracotta accent (single high-meaning hit) */}
        <circle cx="200" cy="150" r="8" fill="#c8623a" opacity="0.95" />
        <circle cx="200" cy="150" r="16" fill="none" stroke="#c8623a" strokeWidth="2" opacity="0.55" />
        <circle cx="200" cy="150" r="24" fill="none" stroke="#c8623a" strokeWidth="1" opacity="0.30" />
    </svg>
);

interface InteractiveMapProps {
    address?: string;
    googleMapsUrl?: string;
    embedUrl?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
    address = "Dişçi Hukuk Bürosu - İzmir/Karşıyaka",
    googleMapsUrl = "https://maps.google.com/?q=Karşıyaka,İzmir",
    embedUrl = "https://maps.google.com/maps?q=38.456222,27.118806&hl=tr&z=17&output=embed"
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleCardClick = () => {
        setIsExpanded(true);
    };

    const handleCloseClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsExpanded(false);
    };

    return (
        <div className="relative w-full h-full">
            <div
                className={`relative overflow-hidden h-full ${!isExpanded ? 'cursor-pointer' : ''}`}
                style={{ background: 'var(--bg-elevated)' }}
                onClick={!isExpanded ? handleCardClick : undefined}
            >
                {/* Header */}
                <div
                    className="relative z-10 flex items-center justify-between gap-3 px-4 py-3"
                    style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-soft)' }}
                >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                            className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                            style={{
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--brand-soft)',
                            }}
                        >
                            <MapPin size={16} strokeWidth={1.75} style={{ color: 'var(--brand-deep)' }} />
                        </div>
                        <div className="min-w-0">
                            <p
                                className="truncate"
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    color: 'var(--ink-strong)',
                                    margin: 0,
                                    lineHeight: 1.25,
                                }}
                            >
                                {address}
                            </p>
                            <p
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '0.6875rem',
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: 'var(--ink-muted)',
                                    margin: 0,
                                    marginTop: '2px',
                                }}
                            >
                                Konum
                            </p>
                        </div>
                    </div>

                    {isExpanded && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="cursor-pointer"
                            style={{
                                padding: '6px',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-base)',
                                border: '1px solid var(--border-soft)',
                                color: 'var(--ink-default)',
                            }}
                            onClick={handleCloseClick}
                            type="button"
                            aria-label="Haritayı kapat"
                        >
                            <X size={14} strokeWidth={1.75} />
                        </motion.button>
                    )}
                </div>

                {/* Map Container */}
                <motion.div
                    className="relative"
                    animate={{ height: isExpanded ? '380px' : '300px' }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                    {/* Abstract SVG Map preview */}
                    <AnimatePresence>
                        {!isExpanded && (
                            <motion.div
                                className="absolute inset-0"
                                style={{ background: 'var(--bg-base)' }}
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <AbstractMapSVG />

                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <motion.div
                                        className="flex items-center gap-2"
                                        style={{
                                            background: 'var(--bg-elevated)',
                                            border: '1px solid var(--border-soft)',
                                            padding: '0.55rem 1rem',
                                            borderRadius: 'var(--radius-pill)',
                                            boxShadow: 'var(--shadow-sm)',
                                        }}
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Navigation size={14} strokeWidth={1.75} style={{ color: 'var(--brand-deep)' }} />
                                        <span
                                            style={{
                                                fontFamily: 'var(--font-sans)',
                                                fontSize: '0.8125rem',
                                                fontWeight: 500,
                                                color: 'var(--ink-strong)',
                                            }}
                                        >
                                            Haritayı açmak için tıklayın
                                        </span>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Google Maps Iframe */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                className="absolute inset-0"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <iframe
                                    src={embedUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Google Maps - Dişçi Hukuk Bürosu"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer CTA */}
                <div
                    className="relative z-10 flex items-center justify-between gap-3 px-4 py-3.5"
                    style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border-soft)' }}
                >
                    <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            flex: 1,
                            padding: '11px 18px',
                            background: 'var(--ink-strong)',
                            color: 'var(--bg-base)',
                            borderRadius: 'var(--radius-pill)',
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            transition: 'background 200ms ease, transform 200ms ease, box-shadow 200ms ease',
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--brand-deep)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--ink-strong)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <MapPin size={14} strokeWidth={1.75} />
                        Yol Tarifi Al
                    </a>
                </div>
            </div>
        </div>
    );
};

export default InteractiveMap;
