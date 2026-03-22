import React, { useState } from 'react';

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

const AttorneyFeeCalculator = () => {
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
    const inputStyle = { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex p-1 rounded-2xl border mb-8 max-w-md mx-auto" style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
                <button onClick={() => setCalcType('fixed')} className={`flex-1 py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${calcType === 'fixed' ? 'bg-gold-500 shadow-lg shadow-gold-500/20' : ''}`} style={calcType === 'fixed' ? { color: 'var(--bg)' } : { color: 'var(--text-2)' }}>Maktu Ücret</button>
                <button onClick={() => setCalcType('nispi')} className={`flex-1 py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${calcType === 'nispi' ? 'bg-gold-500 shadow-lg shadow-gold-500/20' : ''}`} style={calcType === 'nispi' ? { color: 'var(--bg)' } : { color: 'var(--text-2)' }}>Nispi Ücret</button>
            </div>

            <div className="border rounded-3xl p-5 sm:p-6 md:p-10 backdrop-blur-sm" style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
                {calcType === 'fixed' ? (
                    <div className="space-y-8 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium mb-4" style={{ color: 'var(--text-2)' }}>Dava Türü / İşlem Seçiniz</label>
                            <select value={selectedFixed} onChange={(e) => setSelectedFixed(e.target.value)} className="w-full h-14 px-4 sm:px-6 rounded-xl border focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all font-medium" style={inputStyle}>
                                <option value="">Seçiniz...</option>
                                {Object.entries(FIXED_FEES).map(([group, items]) => (
                                    <optgroup key={group} label={group}>
                                        {items.map((item) => (<option key={item.label} value={item.value}>{item.label}</option>))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        {selectedFixed && (
                            <div className="space-y-6 animate-slideUp">
                                <div className="rounded-2xl p-6 sm:p-8 border text-center" style={{ background: 'var(--bg-3)', borderColor: 'var(--border)' }}>
                                    <h3 className="font-medium mb-3" style={{ color: 'var(--text-2)' }}>Asgari Avukatlık Ücreti (KDV Dahil)</h3>
                                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-gold-500">{formatCurrency(parseFloat(selectedFixed))}</p>
                                </div>
                                <div className="flex items-start gap-4 rounded-xl p-5 sm:p-6 md:p-8 border" style={{ background: 'var(--bg-3)', borderColor: 'var(--border)' }}>
                                    <svg className="w-6 h-6 text-gold-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>Bu tutar 2025-2026 yılı AAÜT uyarınca belirlenen resmi asgari tutardır. Davanın mahiyeti ve harcanacak mesaiye göre bu tutar üzerinde serbestçe ücret kararlaştırılabilir.</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
                            {[{ value: 'davalar', label: 'Konusu Para Olan Davalar için' }, { value: 'icra', label: 'İcra Takipleri için' }].map(opt => (
                                <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input type="radio" name="courtType" value={opt.value} checked={courtType === opt.value} onChange={(e) => handleCourtTypeChange(e.target.value)} className="sr-only peer" />
                                        <div className="w-5 h-5 rounded-full border-2 peer-checked:border-gold-500 transition-colors" style={{ borderColor: 'var(--border)' }}></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gold-500 scale-0 peer-checked:scale-100 transition-transform"></div>
                                    </div>
                                    <span className="font-medium text-sm sm:text-base transition-colors" style={{ color: courtType === opt.value ? '#ab934d' : 'var(--text-2)' }}>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-2)' }}>Harca Esas Değer (TL)</label>
                            <input type="number" value={amount} onChange={(e) => { setAmount(e.target.value); calculateNispi(e.target.value); }} placeholder="Hesaplanacak tutarı giriniz..." className="w-full h-14 sm:h-16 px-4 sm:px-6 rounded-xl border focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all font-semibold text-base sm:text-lg" style={inputStyle} />
                        </div>
                        {nispiResult && (
                            <div className="space-y-6 animate-slideUp">
                                <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-3)', borderColor: 'var(--border)' }}>
                                    <div className="px-5 sm:px-6 py-4 border-b" style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
                                        <h4 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{courtType === 'davalar' ? 'Mahkeme Türüne Göre Asgari Ücretler' : 'İcra Takipleri Asgari Ücreti'}</h4>
                                    </div>
                                    <div className="p-5 sm:p-6">
                                        <div className="space-y-3">
                                            {nispiResult.courtFees.map((court, idx) => (
                                                <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                                                    <span className="text-sm" style={{ color: 'var(--text-2)' }}>{court.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-semibold ${court.isBelowMin ? 'text-gold-400' : 'text-green-400'}`}>{formatCurrency(court.calculatedFee)}</span>
                                                        {court.isBelowMin && <span className="text-xs text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded">Maktu</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--bg-3)', borderColor: 'var(--border)' }}>
                                    <div className="px-5 sm:px-6 py-4 border-b" style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
                                        <h4 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Hesaplama Detayları (Kademeli)</h4>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Nispi hesaplama sonucu: {formatCurrency(nispiResult.calculated)}</p>
                                    </div>
                                    <div className="p-5 sm:p-6">
                                        <div className="space-y-4">
                                            {nispiResult.breakdown.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <span style={{ color: 'var(--text-3)' }}>{item.range} aralığı ({item.rate})</span>
                                                    <span className="font-medium" style={{ color: 'var(--text-2)' }}>{formatCurrency(item.fee)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttorneyFeeCalculator;
