import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEarningsThunk, cashOutThunk } from '../../../../redux/riderSlice';

const Earnings = () => {
    const [timeframe, setTimeframe] = useState('weekly');
    const [cashOutState, setCashOutState] = useState('default'); // 'default', 'processing', 'transferred'
    const dispatch = useDispatch();
    const { earnings, loading } = useSelector((state) => state.rider);
    const [chartHeights, setChartHeights] = useState({
        mon: '0%', tue: '0%', wed: '0%', thu: '0%', fri: '0%', sat: '0%', sun: '0%'
    });

    useEffect(() => {
        dispatch(fetchEarningsThunk(timeframe));
    }, [dispatch, timeframe]);

    useEffect(() => {
        // Animate chart bars on load
        setTimeout(() => {
            setChartHeights({
                mon: '45%', tue: '65%', wed: '55%', thu: '85%', fri: '75%', sat: '40%', sun: '30%'
            });
        }, 100);
    }, []);

    const handleCashOut = async () => {
        if (cashOutState !== 'default' || !earnings?.availableBalance || earnings.availableBalance <= 0) return;

        setCashOutState('processing');

        try {
            await dispatch(cashOutThunk()).unwrap();
            setCashOutState('transferred');
            setTimeout(() => {
                setCashOutState('default');
            }, 3000);
        } catch (error) {
            setCashOutState('default');
        }
    };

    if (loading || !earnings) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-primary"><span className="material-symbols-outlined animate-spin text-4xl">sync</span></div>;
    }

    return (
        <main className="flex-1 p-container-margin max-w-7xl mx-auto w-full pb-24 lg:pb-0">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 lg:gap-6">
                        {/* Left Column: Balance & Stats */}
                        <div className="md:col-span-12 lg:col-span-4 space-y-3 lg:space-y-6">
                            {/* Available Balance Card */}
                            <section className="bg-surface-container-high border border-outline-variant rounded-xl p-6 flex flex-col relative overflow-hidden">
                                <div className="relative z-10">
                                    <h2 className="font-inter text-xs font-bold leading-4 text-on-surface-variant mb-unit opacity-80">AVAILABLE BALANCE</h2>
                                    <div className="flex items-baseline gap-unit text-primary">
                                        <span className="font-inter text-[40px] font-bold leading-[48px] tracking-tight">$</span>
                                        <div className="font-inter text-[40px] font-bold leading-[48px] tracking-tight text-on-surface mt-2 mb-1">
                                            €{earnings?.availableBalance?.toFixed(2) || '0.00'}
                                        </div>
                                    </div>
                                    <p className="text-label-sm font-label-sm text-secondary mt-stack-sm flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                        Ready for instant payout
                                    </p>
                                    <button 
                                        onClick={handleCashOut}
                                        disabled={cashOutState !== 'default'}
                                        className={`mt-stack-lg w-full py-4 rounded-lg font-inter text-xs font-bold leading-4 flex items-center justify-center gap-stack-sm transition-all ${
                                            cashOutState === 'default' ? 'bg-primary-container text-on-primary-container hover:brightness-110 active:scale-[0.98]' :
                                            cashOutState === 'processing' ? 'bg-primary-container text-on-primary-container opacity-70 cursor-not-allowed' :
                                            'bg-secondary-container text-on-secondary-container'
                                        }`}
                                    >
                                        {cashOutState === 'default' && (
                                            <>
                                                <span className="material-symbols-outlined">account_balance_wallet</span>
                                                Cash Out Now
                                            </>
                                        )}
                                        {cashOutState === 'processing' && (
                                            <>
                                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                                Processing...
                                            </>
                                        )}
                                        {cashOutState === 'transferred' && (
                                            <>
                                                <span className="material-symbols-outlined">check</span>
                                                Transferred!
                                            </>
                                        )}
                                    </button>
                                </div>
                                {/* Subtle Background Accent */}
                                <div className="absolute -right-4 -bottom-4 opacity-10">
                                    <span className="material-symbols-outlined text-[120px]">payments</span>
                                </div>
                            </section>

                            {/* Earnings Breakdown */}
                            <section className="bg-surface-container border border-outline-variant rounded-xl p-6">
                                <h3 className="font-inter text-xl font-semibold leading-7 mb-stack-md">Earnings Breakdown</h3>
                                <div className="space-y-stack-md">
                                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                                        <div className="flex items-center gap-stack-sm">
                                            <span className="material-symbols-outlined text-on-surface-variant">delivery_dining</span>
                                            <span className="font-inter text-sm font-normal leading-5">Base Pay</span>
                                        </div>
                                        <span className="font-inter text-xs font-bold leading-4 text-on-background">€{earnings?.basePay?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                                        <span className="text-on-surface-variant font-inter text-sm font-normal leading-5 flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-secondary"></span>
                                            Tips
                                        </span>
                                        <span className="font-inter text-xs font-bold leading-4 text-on-background">€{earnings?.tips?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                                        <span className="text-on-surface-variant font-inter text-sm font-normal leading-5 flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-tertiary"></span>
                                            Surge & Incentives
                                        </span>
                                        <span className="font-inter text-xs font-bold leading-4 text-on-background">€{earnings?.incentives?.toFixed(2) || '0.00'}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Stats Quick View */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-surface-container-high border border-outline-variant rounded-xl p-6 h-full flex flex-col justify-between group hover:border-primary/30 transition-colors">
                                    <div>
                                        <span className="font-inter text-xs font-bold leading-4 text-on-surface-variant uppercase tracking-wider">Deliveries</span>
                                        <div className="font-inter text-[40px] font-bold leading-[48px] tracking-tight text-on-surface mt-2">{earnings.totalDeliveries}</div>
                                    </div>
                                    <span className="material-symbols-outlined text-4xl text-primary opacity-50 group-hover:scale-110 transition-transform self-end">local_shipping</span>
                                </div>
                                <div className="bg-surface-container-high border border-outline-variant rounded-xl p-6 h-full flex flex-col justify-between group hover:border-secondary/30 transition-colors">
                                    <div>
                                        <span className="font-inter text-xs font-bold leading-4 text-on-surface-variant uppercase tracking-wider">Online Time</span>
                                        <div className="font-inter text-[40px] font-bold leading-[48px] tracking-tight text-on-surface mt-2">{earnings.hoursOnline.toFixed(1)}h</div>
                                    </div>
                                    <span className="material-symbols-outlined text-4xl text-secondary opacity-50 group-hover:scale-110 transition-transform self-end">schedule</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Graph & History */}
                        <div className="md:col-span-12 lg:col-span-8 space-y-3 lg:space-y-6">
                            {/* Weekly Earnings Graph */}
                            <section className="bg-surface-container-high border border-outline-variant rounded-xl p-6">
                                <div className="flex justify-between items-center mb-stack-lg">
                                    <div>
                                        <h3 className="font-inter text-xl font-semibold leading-7">Weekly Performance</h3>
                                        <p className="text-label-sm font-label-sm text-on-surface-variant">{earnings?.dateRangeString || 'Current Week'}</p>
                                    </div>
                                    <div className="flex gap-2 bg-surface-container-low p-1 rounded-lg">
                                        <button className="px-3 py-1 text-label-sm font-label-bold bg-primary-container text-on-primary-container rounded-md">Weekly</button>
                                        <button className="px-3 py-1 text-label-sm font-label-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors rounded-md">Daily</button>
                                    </div>
                                </div>
                                
                                {/* Visual Graph */}
                                <div className="h-64 flex items-end justify-between px-2 pt-8 gap-stack-sm border-b border-outline-variant">
                                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((dayKey, index) => {
                                        const dayValue = earnings?.weeklyChart?.[index] || 0;
                                        const maxEarnings = Math.max(...(earnings?.weeklyChart || [0]), 100); // 100 as minimum scale
                                        const heightPercentage = `${(dayValue / maxEarnings) * 100}%`;
                                        const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

                                        return (
                                            <div key={dayKey} className="flex-1 group flex flex-col items-center h-full justify-end">
                                                <div className={`w-full ${dayValue > 0 ? 'bg-primary' : 'bg-primary/20'} rounded-t-sm transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:brightness-110 relative`} style={{ height: chartHeights[dayKey] !== '0%' ? heightPercentage : '0%' }}>
                                                    {dayValue > 0 && (
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface-container-highest text-label-sm px-2 py-1 rounded transition-opacity">
                                                            ${dayValue.toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-label-sm font-label-sm mt-stack-sm text-on-surface-variant">{dayLabels[index]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Payout History */}
                            <section className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                                    <h3 className="font-inter text-xl font-semibold leading-7">Payout History</h3>
                                    <button className="text-primary font-inter text-xs font-bold leading-4 flex items-center gap-1 hover:underline">
                                        View Statement
                                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                    </button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#eef4ff] [&::-webkit-scrollbar-thumb]:bg-[#dce3f0] [&::-webkit-scrollbar-thumb]:rounded-sm">
                                    {earnings?.payoutHistory?.length > 0 ? (
                                        earnings.payoutHistory.map((payout, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 hover:bg-surface-container-high transition-colors border-b border-outline-variant/30">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${payout.method === 'Instant Payout' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                                                        <span className="material-symbols-outlined">{payout.method === 'Instant Payout' ? 'bolt' : 'account_balance'}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-inter text-xs font-bold leading-4">{payout.method}</p>
                                                        <p className="text-label-sm font-label-sm text-on-surface-variant">{payout.status} • {new Date(payout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-inter text-xs font-bold leading-4">€{payout.amount.toFixed(2)}</p>
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${payout.status === 'Completed' ? 'text-secondary bg-secondary/10' : 'text-amber-600 bg-amber-100'}`}>
                                                        {payout.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-on-surface-variant font-label-sm">
                                            No payout history available.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
        </main>
    );
};

export default Earnings;
