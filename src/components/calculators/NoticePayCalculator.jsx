import { useState } from 'react';

function getNoticePeriod(tenureYears) {
    if (tenureYears < 0.5) return { weeks: 2, label: '2 Hafta' };
    if (tenureYears < 1.5) return { weeks: 4, label: '4 Hafta' };
    if (tenureYears < 3) return { weeks: 6, label: '6 Hafta' };
    return { weeks: 8, label: '8 Hafta' };
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

const TAX_RATES = [
    { value: 15, label: '%15 (Varsayılan)' },
    { value: 20, label: '%20' },
    { value: 27, label: '%27' },
    { value: 35, label: '%35' },
    { value: 40, label: '%40' },
];

const cardStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-xl)',
    padding: 'clamp(1.25rem, 4vw, 2.5rem)',
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
};

const focusOn = (e) => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-soft)'; };
const focusOff = (e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; };

export default function NoticePayCalculator() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [grossSalary, setGrossSalary] = useState('');
    const [taxRate, setTaxRate] = useState(15);
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
        const tenure = calculateTenure(startDate, endDate);
        const noticePeriod = getNoticePeriod(tenure.totalYears);
        const dailyGross = salary / 30;
        const noticeDays = noticePeriod.weeks * 7;
        const grossNoticePay = dailyGross * noticeDays;
        const incomeTax = grossNoticePay * (taxRate / 100);
        const stampTax = grossNoticePay * 0.00759;
        const totalDeductions = incomeTax + stampTax;
        const netNoticePay = grossNoticePay - totalDeductions;
        setResult({ tenure, noticePeriod, noticeDays, dailyGross, grossNoticePay, incomeTax, stampTax, totalDeductions, netNoticePay, appliedTaxRate: taxRate });
    };

    return (
        <div style={cardStyle}>
            <form onSubmit={handleCalculate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                        <label htmlFor="startDate" style={labelStyle}>İşe Giriş Tarihi</label>
                        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} onFocus={focusOn} onBlur={focusOff} required />
                    </div>
                    <div>
                        <label htmlFor="endDate" style={labelStyle}>İşten Çıkış Tarihi</label>
                        <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} onFocus={focusOn} onBlur={focusOff} required />
                    </div>
                </div>
                <div>
                    <label htmlFor="grossSalary" style={labelStyle}>Brüt Ücret (TL)</label>
                    <input type="number" id="grossSalary" value={grossSalary} onChange={(e) => setGrossSalary(e.target.value)} placeholder="Örn: 50000" min="0" step="0.01" style={inputStyle} onFocus={focusOn} onBlur={focusOff} required />
                </div>
                <div>
                    <label htmlFor="taxRate" style={labelStyle}>Gelir Vergisi Oranı (%)</label>
                    <select id="taxRate" value={taxRate} onChange={(e) => setTaxRate(parseInt(e.target.value))} style={inputStyle} onFocus={focusOn} onBlur={focusOff}>
                        {TAX_RATES.map((rate) => (<option key={rate.value} value={rate.value}>{rate.label}</option>))}
                    </select>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.5rem' }}>
                        Varsayılan %15'tir. Vergi diliminizi biliyorsanız değiştirebilirsiniz.
                    </p>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div style={summaryBoxStyle}>
                                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '0.3rem' }}>Hizmet Süresi</p>
                                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 600, color: 'var(--ink-strong)' }}>
                                    {result.tenure.years} Yıl, {result.tenure.months} Ay, {result.tenure.days} Gün
                                </p>
                            </div>
                            <div style={summaryBoxStyle}>
                                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '0.3rem' }}>İhbar Süresi</p>
                                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 500, color: 'var(--brand-deep)', letterSpacing: '-0.015em' }}>
                                    {result.noticePeriod.label} ({result.noticeDays} Gün)
                                </p>
                            </div>
                        </div>
                        <div className="mb-6">
                            {[
                                ['Günlük Brüt Ücret', formatCurrency(result.dailyGross)],
                                ['Brüt İhbar Tazminatı', formatCurrency(result.grossNoticePay)],
                            ].map(([label, value]) => (
                                <div key={label} style={resultRowStyle}>
                                    <span style={{ color: 'var(--ink-default)' }}>{label}</span>
                                    <span style={{ fontWeight: 500, color: 'var(--ink-strong)' }}>{value}</span>
                                </div>
                            ))}
                            <div style={resultRowStyle}>
                                <span style={{ color: 'var(--ink-default)' }}>Gelir Vergisi (%{result.appliedTaxRate})</span>
                                <span style={{ fontWeight: 500, color: 'var(--accent)' }}>− {formatCurrency(result.incomeTax)}</span>
                            </div>
                            <div style={resultRowStyle}>
                                <span style={{ color: 'var(--ink-default)' }}>Damga Vergisi (%0,759)</span>
                                <span style={{ fontWeight: 500, color: 'var(--accent)' }}>− {formatCurrency(result.stampTax)}</span>
                            </div>
                            <div style={resultRowStyle}>
                                <span style={{ color: 'var(--ink-strong)', fontWeight: 600 }}>Kesintiler Toplamı</span>
                                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{formatCurrency(result.totalDeductions)}</span>
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
                                Net İhbar Tazminatı
                            </p>
                            <p style={{
                                fontFamily: 'var(--font-display)',
                                fontWeight: 500,
                                fontSize: 'clamp(2rem, 5vw, 2.75rem)',
                                letterSpacing: '-0.022em',
                                color: 'var(--brand-deep)',
                                lineHeight: 1.1,
                            }}>
                                {formatCurrency(result.netNoticePay)}
                            </p>
                        </div>
                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <a href="/hesaplama-araclari/kidem-tazminati" className="cursor-pointer"
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
                                Kıdem Tazminatınızı da Hesaplayın
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
