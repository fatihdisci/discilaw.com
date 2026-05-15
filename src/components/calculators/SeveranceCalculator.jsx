import { useState } from 'react';

// Historical Severance Ceilings (Kıdem Tavanı)
const CEILING_HISTORY = [
    { start: '2026-01-01', end: '2026-06-30', amount: 64948.77 },
    { start: '2025-07-01', end: '2025-12-31', amount: 53919.68 },
    { start: '2025-01-01', end: '2025-06-30', amount: 46655.43 },
    { start: '2024-07-01', end: '2024-12-31', amount: 41828.42 },
    { start: '2024-01-01', end: '2024-06-30', amount: 35058.58 },
    { start: '2023-07-01', end: '2023-12-31', amount: 23489.83 },
    { start: '2023-01-01', end: '2023-06-30', amount: 19982.83 },
    { start: '2022-07-01', end: '2022-12-31', amount: 15371.40 },
    { start: '2022-01-01', end: '2022-06-30', amount: 10848.59 },
    { start: '2021-07-01', end: '2021-12-31', amount: 8284.51 },
    { start: '2021-01-01', end: '2021-06-30', amount: 7638.96 },
    { start: '2020-07-01', end: '2020-12-31', amount: 7117.17 }
];

function getCeiling(exitDateStr) {
    const exitDate = new Date(exitDateStr);
    for (const period of CEILING_HISTORY) {
        const start = new Date(period.start);
        const end = new Date(period.end);
        end.setHours(23, 59, 59, 999);
        if (exitDate >= start && exitDate <= end) {
            return { amount: period.amount, period: `${period.start.slice(0, 4)}/${period.start.slice(5, 7) <= '06' ? '1' : '2'}. Dönem` };
        }
    }
    const latestPeriod = CEILING_HISTORY[0];
    if (exitDate > new Date(latestPeriod.end)) {
        return { amount: latestPeriod.amount, period: 'Güncel Dönem' };
    }
    const oldestPeriod = CEILING_HISTORY[CEILING_HISTORY.length - 1];
    return { amount: oldestPeriod.amount, period: '2020/2. Dönem (En Eski)' };
}

function calculateTenure(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    if (days < 0) { months--; const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0); days += prevMonth.getDate(); }
    if (months < 0) { years--; months += 12; }
    const totalYears = years + (months / 12) + (days / 365);
    return { years, months, days, totalYears };
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(amount);
}

const cardStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-xl)',
    padding: '1.5rem',
};

const inputStyle = {
    background: 'var(--bg-base)',
    border: '1px solid var(--border)',
    color: 'var(--ink-strong)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9375rem',
    height: '48px',
    width: '100%',
    padding: '0 14px',
    borderRadius: 'var(--radius-md)',
    transition: 'border-color 200ms ease, box-shadow 200ms ease',
    outline: 'none',
};

const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    fontSize: '0.8125rem',
    color: 'var(--ink-default)',
    marginBottom: '0.5rem',
};

const buttonStyle = {
    width: '100%',
    padding: '14px 26px',
    background: 'var(--ink-strong)',
    color: 'var(--bg-base)',
    border: 'none',
    borderRadius: 'var(--radius-pill)',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    fontSize: '0.9375rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'background 200ms ease, transform 200ms ease, box-shadow 200ms ease',
};

const errorStyle = {
    background: 'var(--accent-soft)',
    border: '1px solid rgba(200, 98, 58, 0.30)',
    borderLeft: '3px solid var(--accent)',
    borderRadius: 'var(--radius-md)',
    padding: '0.85rem 1rem',
    color: 'var(--ink-strong)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.875rem',
};

const resultRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.6rem 0',
    borderBottom: '1px solid var(--border-soft)',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9375rem',
};

const summaryBoxStyle = {
    background: 'var(--bg-base)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-md)',
    padding: '0.95rem 1.1rem',
    marginBottom: '0.85rem',
};

export default function SeveranceCalculator() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [grossSalary, setGrossSalary] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleCalculate = (e) => {
        e.preventDefault();
        setError('');
        setResult(null);
        if (!startDate || !endDate || !grossSalary) { setError('Lütfen tüm alanları doldurunuz.'); return; }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const salary = parseFloat(grossSalary);
        if (end <= start) { setError('İşten çıkış tarihi, işe giriş tarihinden sonra olmalıdır.'); return; }
        if (salary <= 0) { setError('Geçerli bir brüt ücret giriniz.'); return; }
        const ceilingInfo = getCeiling(endDate);
        const ceiling = ceilingInfo.amount;
        const tenure = calculateTenure(startDate, endDate);
        if (tenure.totalYears < 1) { setError('Kıdem tazminatı hakkı için en az 1 yıl çalışmış olmanız gerekmektedir.'); return; }
        const baseSalary = Math.min(salary, ceiling);
        const isCeilingApplied = salary > ceiling;
        const grossSeverance = baseSalary * tenure.totalYears;
        const stampTax = grossSeverance * 0.00759;
        const netSeverance = grossSeverance - stampTax;
        setResult({ tenure, ceiling, ceilingPeriod: ceilingInfo.period, baseSalary, isCeilingApplied, grossSeverance, stampTax, netSeverance });
    };

    return (
        <div style={{ ...cardStyle, padding: 'clamp(1.25rem, 4vw, 2.5rem)' }}>
            <form onSubmit={handleCalculate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                        <label htmlFor="startDate" style={labelStyle}>İşe Giriş Tarihi</label>
                        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                            style={inputStyle}
                            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-soft)'; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                            required />
                    </div>
                    <div>
                        <label htmlFor="endDate" style={labelStyle}>İşten Çıkış Tarihi</label>
                        <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                            style={inputStyle}
                            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-soft)'; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                            required />
                    </div>
                </div>
                <div>
                    <label htmlFor="grossSalary" style={labelStyle}>Brüt Ücret (TL)</label>
                    <input type="number" id="grossSalary" value={grossSalary} onChange={(e) => setGrossSalary(e.target.value)}
                        placeholder="Örn: 50000" min="0" step="0.01"
                        style={inputStyle}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-soft)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                        required />
                </div>
                {error && <div style={errorStyle}>{error}</div>}
                <button type="submit"
                    style={buttonStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-deep)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--ink-strong)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                    Hesapla
                </button>
            </form>

            {result && (
                <div className="mt-8">
                    <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '2rem' }}>
                        <h3 style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 500,
                            fontStyle: 'italic',
                            fontSize: '1.5rem',
                            letterSpacing: '-0.018em',
                            color: 'var(--ink-strong)',
                            marginBottom: '1.5rem',
                        }}>
                            Hesaplama Sonucu
                        </h3>
                        <div style={summaryBoxStyle}>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '0.3rem' }}>Hizmet Süresi</p>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.0625rem', fontWeight: 600, color: 'var(--ink-strong)' }}>
                                {result.tenure.years} Yıl, {result.tenure.months} Ay, {result.tenure.days} Gün
                            </p>
                        </div>
                        <div style={summaryBoxStyle}>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '0.3rem' }}>
                                Kullanılan Kıdem Tavanı ({result.ceilingPeriod})
                            </p>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--brand-deep)', letterSpacing: '-0.015em' }}>
                                {formatCurrency(result.ceiling)}
                            </p>
                        </div>
                        {result.isCeilingApplied && (
                            <div style={{
                                background: 'var(--brand-soft)',
                                border: '1px solid var(--border-soft)',
                                borderLeft: '3px solid var(--brand)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.85rem 1rem',
                                marginBottom: '1rem',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.875rem',
                                color: 'var(--ink-strong)',
                            }}>
                                <strong>Bilgi:</strong> Brüt ücretiniz kıdem tavanını aştığı için, hesaplama <strong>{formatCurrency(result.ceiling)}</strong> üzerinden yapılmıştır.
                            </div>
                        )}
                        <div className="mb-6">
                            {[
                                ['Hesaba Esas Ücret', formatCurrency(result.baseSalary)],
                                ['Brüt Kıdem Tazminatı', formatCurrency(result.grossSeverance)],
                            ].map(([label, value]) => (
                                <div key={label} style={resultRowStyle}>
                                    <span style={{ color: 'var(--ink-default)' }}>{label}</span>
                                    <span style={{ fontWeight: 500, color: 'var(--ink-strong)' }}>{value}</span>
                                </div>
                            ))}
                            <div style={resultRowStyle}>
                                <span style={{ color: 'var(--ink-default)' }}>Damga Vergisi (%0,759)</span>
                                <span style={{ fontWeight: 500, color: 'var(--accent)' }}>− {formatCurrency(result.stampTax)}</span>
                            </div>
                        </div>
                        <div style={{
                            background: 'var(--brand-soft)',
                            border: '1px solid var(--brand)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1.5rem 1.25rem',
                            textAlign: 'center',
                        }}>
                            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '0.5rem' }}>
                                Net Kıdem Tazminatı
                            </p>
                            <p style={{
                                fontFamily: 'var(--font-display)',
                                fontWeight: 500,
                                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                                letterSpacing: '-0.022em',
                                color: 'var(--brand-deep)',
                                lineHeight: 1.1,
                            }}>
                                {formatCurrency(result.netSeverance)}
                            </p>
                        </div>
                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <a href="/hesaplama-araclari/ihbar-tazminati" className="cursor-pointer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '12px 22px',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-pill)',
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    color: 'var(--ink-strong)',
                                    background: 'transparent',
                                    transition: 'background 200ms ease, border-color 200ms ease, color 200ms ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-soft)'; e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand-deep)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink-strong)'; }}
                            >
                                Sırada İhbar Tazminatı Var
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
