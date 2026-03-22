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
                <div>
                    <label htmlFor="taxRate" className="block text-sm font-medium mb-2" style={labelStyle}>Gelir Vergisi Oranı (%)</label>
                    <select id="taxRate" value={taxRate} onChange={(e) => setTaxRate(parseInt(e.target.value))} className="w-full h-12 px-4 rounded-lg border focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all" style={inputStyle}>
                        {TAX_RATES.map((rate) => (<option key={rate.value} value={rate.value}>{rate.label}</option>))}
                    </select>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>Varsayılan %15'tir. Vergi diliminizi biliyorsanız değiştirebilirsiniz.</p>
                </div>
                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>}
                <button type="submit" className="w-full py-4 bg-gold-500 hover:bg-gold-600 font-bold rounded-lg transition-all shadow-lg shadow-gold-500/20 active:scale-[0.98]" style={{ color: 'var(--bg)' }}>HESAPLA</button>
            </form>

            {result && (
                <div className="mt-8 space-y-6">
                    <div className="border-t pt-8" style={{ borderColor: 'var(--border)' }}>
                        <h3 className="text-xl font-bold mb-6 font-display" style={{ color: 'var(--text)' }}>Hesaplama Sonucu</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="rounded-lg p-4" style={{ background: 'var(--bg-3)' }}>
                                <p className="text-sm mb-1" style={{ color: 'var(--text-3)' }}>Hizmet Süresi</p>
                                <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{result.tenure.years} Yıl, {result.tenure.months} Ay, {result.tenure.days} Gün</p>
                            </div>
                            <div className="rounded-lg p-4" style={{ background: 'var(--bg-3)' }}>
                                <p className="text-sm mb-1" style={{ color: 'var(--text-3)' }}>İhbar Süresi</p>
                                <p className="text-gold-500 text-lg font-semibold">{result.noticePeriod.label} ({result.noticeDays} Gün)</p>
                            </div>
                        </div>
                        <div className="space-y-3 mb-6">
                            {[
                                ['Günlük Brüt Ücret', formatCurrency(result.dailyGross)],
                                ['Brüt İhbar Tazminatı', formatCurrency(result.grossNoticePay)],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                                    <span style={{ color: 'var(--text-2)' }}>{label}</span>
                                    <span className="font-medium" style={{ color: 'var(--text)' }}>{value}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                                <span style={{ color: 'var(--text-2)' }}>Gelir Vergisi (%{result.appliedTaxRate})</span>
                                <span className="text-red-400 font-medium">- {formatCurrency(result.incomeTax)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                                <span style={{ color: 'var(--text-2)' }}>Damga Vergisi (%0,759)</span>
                                <span className="text-red-400 font-medium">- {formatCurrency(result.stampTax)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                                <span className="font-semibold" style={{ color: 'var(--text-2)' }}>Kesintiler Toplamı</span>
                                <span className="text-red-400 font-semibold">{formatCurrency(result.totalDeductions)}</span>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-gold-500/20 to-gold-600/10 border border-gold-500/30 rounded-xl p-6 text-center">
                            <p className="text-sm mb-2" style={{ color: 'var(--text-2)' }}>NET İHBAR TAZMİNATI</p>
                            <p className="text-3xl md:text-4xl font-bold text-gold-500">{formatCurrency(result.netNoticePay)}</p>
                        </div>
                        <div className="mt-6 text-center">
                            <a href="/hesaplama-araclari/kidem-tazminati" className="inline-flex items-center px-6 py-3 border border-gold-500/50 text-gold-500 hover:bg-gold-500/10 rounded-lg transition-all font-medium">Kıdem Tazminatınızı da Hesaplayın →</a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
