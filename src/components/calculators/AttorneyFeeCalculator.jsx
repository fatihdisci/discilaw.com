import { useState } from 'react';
import { Info } from 'lucide-react';

const FIXED_FEES = {
    "Danışmanlık": [
        { label: "Sözlü Danışma (Büroda - 1 Saat) - 4.000 TL", value: 4000 },
        { label: "Yazılı Danışma (1 Saat) - 7.000 TL", value: 7000 },
        { label: "İhtarname / Protesto Yazımı - 6.000 TL", value: 6000 },
        { label: "Kira Sözleşmesi Hazırlama - 8.000 TL", value: 8000 }
    ],
    "Ceza Mahkemeleri": [
        { label: "Sulh Ceza Hakimliği - 18.000 TL", value: 18000 },
        { label: "Asliye Ceza Mahkemesi - 45.000 TL", value: 45000 },
        { label: "Ağır Ceza Mahkemesi - 65.000 TL", value: 65000 },
        { label: "Çocuk Mahkemesi - 45.000 TL", value: 45000 }
    ],
    "Hukuk Mahkemeleri": [
        { label: "Sulh Hukuk Mahkemesi - 30.000 TL", value: 30000 },
        { label: "Asliye Hukuk Mahkemesi - 45.000 TL", value: 45000 },
        { label: "Aile (Boşanma vb.) Mahkemesi - 45.000 TL", value: 45000 },
        { label: "Tüketici Mahkemesi - 22.500 TL", value: 22500 },
        { label: "Fikri ve Sınai Haklar - 55.000 TL", value: 55000 }
    ],
    "İcra ve İflas": [
        { label: "İcra Mahkemesi (Duruşmalı) - 18.000 TL", value: 18000 },
        { label: "İcra Mahkemesi (Duruşmasız) - 11.000 TL", value: 11000 }
    ],
    "İdare ve Vergi Mahkemeleri": [
        { label: "İdare Mahkemesi (Duruşmalı) - 40.000 TL", value: 40000 },
        { label: "İdare Mahkemesi (Duruşmasız) - 30.000 TL", value: 30000 },
        { label: "Vergi Mahkemesi (Duruşmalı) - 40.000 TL", value: 40000 },
        { label: "Vergi Mahkemesi (Duruşmasız) - 30.000 TL", value: 30000 }
    ],
    "Yüksek Yargı": [
        { label: "Danıştay (İlk Derece - Duruşmasız) - 40.000 TL", value: 40000 },
        { label: "Anayasa Mahkemesi (Bireysel Başvuru - Duruşmasız) - 40.000 TL", value: 40000 }
    ]
};

const TRANCHES = [
    { limit: 600000, rate: 0.16 },
    { limit: 600000, rate: 0.15 },
    { limit: 1200000, rate: 0.14 },
    { limit: 1200000, rate: 0.13 },
    { limit: 1800000, rate: 0.11 },
    { limit: 2400000, rate: 0.08 },
    { limit: 3000000, rate: 0.05 },
    { limit: 3600000, rate: 0.03 },
    { limit: 4200000, rate: 0.02 },
    { limit: Infinity, rate: 0.01 }
];

const COURT_MIN_FEES = {
    davalar: [
        { name: "İcra Mahkemeleri", minFee: 18000 },
        { name: "Sulh Hukuk Mahkemeleri", minFee: 30000 },
        { name: "Sulh Ceza/İnfaz Hakimlikleri", minFee: 18000 },
        { name: "Asliye Mahkemeleri", minFee: 45000 },
        { name: "Tüketici Mahkemeleri", minFee: 22500 },
        { name: "Fikri ve Sınai Haklar Mahkemeleri", minFee: 55000 },
        { name: "İdare ve Vergi Mahkemeleri-Duruşmalı", minFee: 40000 },
        { name: "İdare ve Vergi Mahkemeleri-Duruşmasız", minFee: 30000 },
    ],
    icra: [
        { name: "İcra Takipleri", minFee: 9000 },
    ]
};

const inputStyle = {
    background: 'var(--bg-base)',
    border: '1px solid var(--border)',
    color: 'var(--ink-strong)',
    fontFamily: 'var(--font-sans)',
    fontSize: '1rem',
    height: '52px',
    width: '100%',
    padding: '0 16px',
    borderRadius: 'var(--radius-md)',
    transition: 'border-color 200ms ease, box-shadow 200ms ease',
    outline: 'none',
};
const focusOn = (e) => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-soft)'; };
const focusOff = (e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; };

export default function AttorneyFeeCalculator() {
    const [calcType, setCalcType] = useState('fixed');
    const [selectedFixed, setSelectedFixed] = useState('');
    const [amount, setAmount] = useState('');
    const [courtType, setCourtType] = useState('davalar');
    const [nispiResult, setNispiResult] = useState(null);

    const formatCurrency = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(val);

    const calculateNispi = (val, cType = courtType) => {
        const numVal = parseFloat(val);
        if (isNaN(numVal) || numVal <= 0) { setNispiResult(null); return; }
        let remaining = numVal;
        let totalFee = 0;
        const breakdown = [];
        for (const tranche of TRANCHES) {
            const amountInTranche = Math.min(remaining, tranche.limit);
            if (amountInTranche <= 0) break;
            const fee = amountInTranche * tranche.rate;
            totalFee += fee;
            breakdown.push({ range: tranche.limit === Infinity ? 'Üzeri' : formatCurrency(tranche.limit), rate: (tranche.rate * 100).toFixed(0) + '%', fee });
            remaining -= amountInTranche;
            if (tranche.limit === Infinity) break;
        }
        const courts = COURT_MIN_FEES[cType];
        const courtFees = courts.map(court => {
            let finalFee, isBelowMin = false;
            if (numVal < court.minFee) { finalFee = numVal; isBelowMin = true; }
            else { finalFee = Math.max(totalFee, court.minFee); }
            return { name: court.name, minFee: court.minFee, calculatedFee: finalFee, isBelowMin };
        });
        setNispiResult({ calculated: totalFee, baseValue: numVal, breakdown, courtFees });
    };

    const handleCourtTypeChange = (newType) => { setCourtType(newType); if (amount) calculateNispi(amount, newType); };

    const tabBaseStyle = {
        flex: 1,
        padding: '12px 18px',
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        fontSize: '0.9375rem',
        cursor: 'pointer',
        border: 'none',
        transition: 'background 220ms ease, color 220ms ease',
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Mode toggle (pill segment) */}
            <div
                className="flex p-1 mb-8 max-w-md mx-auto"
                style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: 'var(--radius-pill)',
                }}
            >
                <button
                    onClick={() => setCalcType('fixed')}
                    style={{
                        ...tabBaseStyle,
                        background: calcType === 'fixed' ? 'var(--ink-strong)' : 'transparent',
                        color: calcType === 'fixed' ? 'var(--bg-base)' : 'var(--ink-default)',
                    }}
                >
                    Maktu Ücret
                </button>
                <button
                    onClick={() => setCalcType('nispi')}
                    style={{
                        ...tabBaseStyle,
                        background: calcType === 'nispi' ? 'var(--ink-strong)' : 'transparent',
                        color: calcType === 'nispi' ? 'var(--bg-base)' : 'var(--ink-default)',
                    }}
                >
                    Nispi Ücret
                </button>
            </div>

            <div
                style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'clamp(1.25rem, 4vw, 2.5rem)',
                }}
            >
                {calcType === 'fixed' ? (
                    <div className="space-y-7">
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 500,
                                    fontSize: '0.8125rem',
                                    color: 'var(--ink-default)',
                                    marginBottom: '0.625rem',
                                }}
                            >
                                Dava Türü / İşlem Seçiniz
                            </label>
                            <select
                                value={selectedFixed}
                                onChange={(e) => setSelectedFixed(e.target.value)}
                                style={inputStyle}
                                onFocus={focusOn}
                                onBlur={focusOff}
                            >
                                <option value="">Seçiniz...</option>
                                {Object.entries(FIXED_FEES).map(([group, items]) => (
                                    <optgroup key={group} label={group}>
                                        {items.map((item) => (
                                            <option key={item.label} value={item.value}>{item.label}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {selectedFixed && (
                            <div className="space-y-5">
                                <div
                                    style={{
                                        background: 'var(--brand-soft)',
                                        border: '1px solid var(--brand)',
                                        borderRadius: 'var(--radius-lg)',
                                        padding: '1.75rem 1.5rem',
                                        textAlign: 'center',
                                    }}
                                >
                                    <p
                                        style={{
                                            fontFamily: 'var(--font-sans)',
                                            fontSize: '0.6875rem',
                                            letterSpacing: '0.22em',
                                            textTransform: 'uppercase',
                                            color: 'var(--ink-muted)',
                                            marginBottom: '0.65rem',
                                        }}
                                    >
                                        Asgari Avukatlık Ücreti (KDV Dahil)
                                    </p>
                                    <p
                                        style={{
                                            fontFamily: 'var(--font-display)',
                                            fontWeight: 500,
                                            fontSize: 'clamp(2rem, 6vw, 3rem)',
                                            letterSpacing: '-0.022em',
                                            color: 'var(--brand-deep)',
                                            lineHeight: 1.1,
                                        }}
                                    >
                                        {formatCurrency(parseFloat(selectedFixed))}
                                    </p>
                                </div>
                                <div
                                    className="flex items-start gap-3"
                                    style={{
                                        background: 'var(--bg-base)',
                                        border: '1px solid var(--border-soft)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '1rem 1.25rem',
                                    }}
                                >
                                    <Info size={18} strokeWidth={1.75} style={{ color: 'var(--brand-deep)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--ink-default)', margin: 0 }}>
                                        Bu tutar 2025-2026 yılı AAÜT uyarınca belirlenen resmi asgari tutardır. Davanın mahiyeti ve harcanacak mesaiye göre bu tutar üzerinde serbestçe ücret kararlaştırılabilir.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-7">
                        <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
                            {[
                                { value: 'davalar', label: 'Konusu Para Olan Davalar için' },
                                { value: 'icra', label: 'İcra Takipleri için' },
                            ].map((opt) => {
                                const checked = courtType === opt.value;
                                return (
                                    <label
                                        key={opt.value}
                                        className="flex items-center gap-3 cursor-pointer"
                                        style={{ fontFamily: 'var(--font-sans)' }}
                                    >
                                        <span style={{ position: 'relative', display: 'inline-block', width: 18, height: 18 }}>
                                            <input
                                                type="radio"
                                                name="courtType"
                                                value={opt.value}
                                                checked={checked}
                                                onChange={(e) => handleCourtTypeChange(e.target.value)}
                                                style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', margin: 0, cursor: 'pointer' }}
                                            />
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    borderRadius: '50%',
                                                    border: `2px solid ${checked ? 'var(--brand-deep)' : 'var(--border)'}`,
                                                    background: 'var(--bg-elevated)',
                                                    transition: 'border-color 180ms ease',
                                                }}
                                                aria-hidden="true"
                                            />
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: `translate(-50%, -50%) scale(${checked ? 1 : 0})`,
                                                    width: 9,
                                                    height: 9,
                                                    borderRadius: '50%',
                                                    background: 'var(--brand-deep)',
                                                    transition: 'transform 180ms ease',
                                                }}
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span
                                            style={{
                                                fontWeight: 500,
                                                fontSize: '0.9375rem',
                                                color: checked ? 'var(--brand-deep)' : 'var(--ink-default)',
                                                transition: 'color 180ms ease',
                                            }}
                                        >
                                            {opt.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 500,
                                    fontSize: '0.8125rem',
                                    color: 'var(--ink-default)',
                                    marginBottom: '0.625rem',
                                }}
                            >
                                Harca Esas Değer (TL)
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => { setAmount(e.target.value); calculateNispi(e.target.value); }}
                                placeholder="Hesaplanacak tutarı giriniz..."
                                style={{ ...inputStyle, height: '56px', fontSize: '1.0625rem', fontWeight: 500 }}
                                onFocus={focusOn}
                                onBlur={focusOff}
                            />
                        </div>

                        {nispiResult && (
                            <div className="space-y-5">
                                <div
                                    style={{
                                        background: 'var(--bg-base)',
                                        border: '1px solid var(--border-soft)',
                                        borderRadius: 'var(--radius-lg)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '0.95rem 1.25rem',
                                            borderBottom: '1px solid var(--border-soft)',
                                            background: 'var(--bg-elevated)',
                                        }}
                                    >
                                        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1rem', color: 'var(--ink-strong)', letterSpacing: '-0.015em' }}>
                                            {courtType === 'davalar' ? 'Mahkeme Türüne Göre Asgari Ücretler' : 'İcra Takipleri Asgari Ücreti'}
                                        </h4>
                                    </div>
                                    <div style={{ padding: '0.5rem 1.25rem' }}>
                                        {nispiResult.courtFees.map((court, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    gap: '0.75rem',
                                                    padding: '0.7rem 0',
                                                    borderBottom: idx === nispiResult.courtFees.length - 1 ? 'none' : '1px solid var(--border-soft)',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '0.875rem',
                                                }}
                                            >
                                                <span style={{ color: 'var(--ink-default)', flex: '1 1 auto', minWidth: 0, lineHeight: 1.4 }}>{court.name}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                    <span style={{ fontWeight: 600, color: court.isBelowMin ? 'var(--brand-deep)' : 'var(--ink-strong)' }}>
                                                        {formatCurrency(court.calculatedFee)}
                                                    </span>
                                                    {court.isBelowMin && (
                                                        <span
                                                            style={{
                                                                fontFamily: 'var(--font-sans)',
                                                                fontSize: '0.6875rem',
                                                                fontWeight: 500,
                                                                letterSpacing: '0.06em',
                                                                textTransform: 'uppercase',
                                                                color: 'var(--brand-deep)',
                                                                background: 'var(--brand-soft)',
                                                                padding: '0.2rem 0.45rem',
                                                                borderRadius: 'var(--radius-pill)',
                                                            }}
                                                        >
                                                            Maktu
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        background: 'var(--bg-base)',
                                        border: '1px solid var(--border-soft)',
                                        borderRadius: 'var(--radius-lg)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '0.95rem 1.25rem',
                                            borderBottom: '1px solid var(--border-soft)',
                                            background: 'var(--bg-elevated)',
                                        }}
                                    >
                                        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1rem', color: 'var(--ink-strong)', letterSpacing: '-0.015em' }}>
                                            Hesaplama Detayları (Kademeli)
                                        </h4>
                                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.25rem' }}>
                                            Nispi hesaplama sonucu: {formatCurrency(nispiResult.calculated)}
                                        </p>
                                    </div>
                                    <div style={{ padding: '0.5rem 1.25rem' }}>
                                        {nispiResult.breakdown.map((item, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '0.6rem 0',
                                                    borderBottom: idx === nispiResult.breakdown.length - 1 ? 'none' : '1px solid var(--border-soft)',
                                                    fontFamily: 'var(--font-sans)',
                                                    fontSize: '0.8125rem',
                                                }}
                                            >
                                                <span style={{ color: 'var(--ink-muted)' }}>{item.range} aralığı ({item.rate})</span>
                                                <span style={{ fontWeight: 500, color: 'var(--ink-strong)' }}>{formatCurrency(item.fee)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
