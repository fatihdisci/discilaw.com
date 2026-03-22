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

    const inputStyle = { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };
    const labelStyle = { color: 'var(--text-2)' };

    return (
        <div className="rounded-2xl p-5 sm:p-6 md:p-10 border" style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
            <form onSubmit={handleCalculate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium mb-2" style={labelStyle}>İşe Giriş Tarihi</label>
                        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-12 px-4 rounded-lg border focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all" style={inputStyle} required />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium mb-2" style={labelStyle}>İşten Çıkış Tarihi</label>
                        <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full h-12 px-4 rounded-lg border focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all" style={inputStyle} required />
                    </div>
                </div>
                <div>
                    <label htmlFor="grossSalary" className="block text-sm font-medium mb-2" style={labelStyle}>Brüt Ücret (TL)</label>
                    <input type="number" id="grossSalary" value={grossSalary} onChange={(e) => setGrossSalary(e.target.value)} placeholder="Örn: 50000" min="0" step="0.01" className="w-full h-12 px-4 rounded-lg border focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all" style={inputStyle} required />
                </div>
                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>}
                <button type="submit" className="w-full py-4 bg-gold-500 hover:bg-gold-600 font-bold rounded-lg transition-all shadow-lg shadow-gold-500/20 active:scale-[0.98]" style={{ color: 'var(--bg)' }}>HESAPLA</button>
            </form>

            {result && (
                <div className="mt-8 space-y-6">
                    <div className="border-t pt-8" style={{ borderColor: 'var(--border)' }}>
                        <h3 className="text-xl font-bold mb-6 font-display" style={{ color: 'var(--text)' }}>Hesaplama Sonucu</h3>
                        <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--bg-3)' }}>
                            <p className="text-sm mb-1" style={{ color: 'var(--text-3)' }}>Hizmet Süresi</p>
                            <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{result.tenure.years} Yıl, {result.tenure.months} Ay, {result.tenure.days} Gün</p>
                        </div>
                        <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--bg-3)' }}>
                            <p className="text-sm mb-1" style={{ color: 'var(--text-3)' }}>Kullanılan Kıdem Tavanı ({result.ceilingPeriod})</p>
                            <p className="text-gold-500 text-lg font-semibold">{formatCurrency(result.ceiling)}</p>
                        </div>
                        {result.isCeilingApplied && (
                            <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4 mb-4">
                                <p className="text-gold-400 text-sm"><strong>Bilgi:</strong> Brüt ücretiniz kıdem tavanını aştığı için, hesaplama <strong>{formatCurrency(result.ceiling)}</strong> üzerinden yapılmıştır.</p>
                            </div>
                        )}
                        <div className="space-y-3 mb-6">
                            {[
                                ['Hesaba Esas Ücret', formatCurrency(result.baseSalary), 'var(--text)'],
                                ['Brüt Kıdem Tazminatı', formatCurrency(result.grossSeverance), 'var(--text)'],
                            ].map(([label, value, color]) => (
                                <div key={label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                                    <span style={{ color: 'var(--text-2)' }}>{label}</span>
                                    <span className="font-medium" style={{ color }}>{value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                                <span style={{ color: 'var(--text-2)' }}>Damga Vergisi (%0,759)</span>
                                <span className="text-red-400 font-medium">- {formatCurrency(result.stampTax)}</span>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-gold-500/20 to-gold-600/10 border border-gold-500/30 rounded-xl p-6 text-center">
                            <p className="text-sm mb-2" style={{ color: 'var(--text-2)' }}>NET KIDEM TAZMİNATI</p>
                            <p className="text-3xl md:text-4xl font-bold text-gold-500">{formatCurrency(result.netSeverance)}</p>
                        </div>
                        <div className="mt-6 text-center">
                            <a href="/hesaplama-araclari/ihbar-tazminati" className="inline-flex items-center px-6 py-3 border border-gold-500/50 text-gold-500 hover:bg-gold-500/10 rounded-lg transition-all font-medium">Sırada İhbar Tazminatı Var →</a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
