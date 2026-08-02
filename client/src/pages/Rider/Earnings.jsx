import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEarningsThunk } from '../../features/rider/riderSlice';
import './RiderTheme.css';

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

    const handleCashOut = () => {
        if (cashOutState !== 'default') return;

        setCashOutState('processing');

        setTimeout(() => {
            setCashOutState('transferred');
            
            // Reset after 3 seconds
            setTimeout(() => {
                setCashOutState('default');
            }, 3000);
        }, 1500);
    };

    if (loading || !earnings) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-primary"><span className="material-symbols-outlined animate-spin text-4xl">sync</span></div>;
    }

    return (
        <div className="rider-theme bg-background text-on-background font-body-md overflow-x-hidden min-h-screen dark">
            {/* TopAppBar */}
            <header className="fixed top-0 w-full z-50 bg-background border-b border-outline-variant flex justify-between items-center px-container-margin py-stack-sm">
                <div className="flex items-center gap-stack-md">
                    <span className="font-headline-md text-headline-md-mobile lg:text-headline-md font-bold text-primary">Foodora Rider</span>
                </div>
                <div className="flex items-center gap-stack-md">
                    <button className="p-unit text-on-surface-variant hover:bg-surface-container transition-colors duration-200 rounded-full">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden">
                        <img 
                            className="w-full h-full object-cover" 
                            alt="Rider avatar" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX6YblvZ1_Ch9JMen1Bl12WhH0kJWd0EcwKqZA8RgaXAhr1Ba25P3q56xscUwBywfVkJK4QilRRsvVgOG8oErkQc0G644cvWpcqn5y9wn9qR7HnRxskeDx8Y-R9CesRdNVjD44Y258GlZ8X_dMKkgqLNihte9kZnQLnsqF2EhPRmVV9bzZDbb7ICRnMhShazfdsQANosuX_Dd147qHKCkyD_CGvyxAbwvpDITjueGVkt_GQ3cGsBglEA" 
                        />
                    </div>
                </div>
            </header>

            <div className="flex pt-16 pb-20 lg:pb-0 min-h-screen">
                {/* SideNavBar (Desktop Only) */}
                <aside className="fixed left-0 top-0 h-full w-64 hidden lg:flex flex-col bg-surface border-r border-outline-variant py-stack-lg z-40">
                    <div className="px-container-margin mb-stack-lg">
                        <span className="font-headline-md text-headline-md font-bold text-primary">Rider Dashboard</span>
                        <p className="text-label-bold font-label-bold text-on-surface-variant opacity-70">Utility Logistics</p>
                    </div>
                    <nav className="flex-1 flex flex-col space-y-1">
                        <Link to="/rider/dashboard" className="flex items-center px-6 py-3 text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95">
                            <span className="material-symbols-outlined mr-4">dashboard</span>
                            <span className="font-label-bold text-label-bold">Overview</span>
                        </Link>
                        <Link to="/rider/active-deliveries" className="flex items-center px-6 py-3 text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95">
                            <span className="material-symbols-outlined mr-4">local_shipping</span>
                            <span className="font-label-bold text-label-bold">Active Deliveries</span>
                        </Link>
                        <Link to="/rider/earnings" className="flex items-center px-6 py-3 text-primary font-bold border-l-4 border-primary bg-surface-container-high transition-transform active:scale-95">
                            <span className="material-symbols-outlined mr-4" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                            <span className="font-label-bold text-label-bold">Earnings</span>
                        </Link>
                        <Link to="/rider/ratings" className="flex items-center px-6 py-3 text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95">
                            <span className="material-symbols-outlined mr-4">star</span>
                            <span className="font-label-bold text-label-bold">Ratings</span>
                        </Link>
                        <a className="flex items-center px-6 py-3 text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95" href="#">
                            <span className="material-symbols-outlined mr-4">settings</span>
                            <span className="font-label-bold text-label-bold">Settings</span>
                        </a>
                    </nav>
                    <div className="px-container-margin mt-auto">
                        <button className="w-full bg-primary-container text-on-primary-container py-3 rounded-xl font-label-bold text-label-bold tracking-wider hover:opacity-90 active:scale-95 transition-all">
                            GO ONLINE
                        </button>
                        <div className="mt-stack-lg border-t border-outline-variant pt-stack-md">
                            <a className="flex items-center text-on-surface-variant hover:bg-surface-container-low py-2 px-2 rounded" href="#">
                                <span className="material-symbols-outlined mr-2">help</span>
                                <span className="font-label-bold text-label-bold">Help Center</span>
                            </a>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 lg:ml-64 p-container-margin max-w-7xl mx-auto w-full">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter lg:gap-stack-lg">
                        {/* Left Column: Balance & Stats */}
                        <div className="md:col-span-12 lg:col-span-4 space-y-gutter lg:space-y-stack-lg">
                            {/* Available Balance Card */}
                            <section className="bg-surface-container-high border border-outline-variant rounded-xl p-stack-lg flex flex-col relative overflow-hidden">
                                <div className="relative z-10">
                                    <h2 className="font-label-bold text-label-bold text-on-surface-variant mb-unit opacity-80">AVAILABLE BALANCE</h2>
                                    <div className="flex items-baseline gap-unit text-primary">
                                        <span className="font-display-earnings text-display-earnings">$</span>
                                        <div className="font-display-earnings text-display-earnings text-on-surface mt-2 mb-1">
                                            €{earnings.availableBalance.toFixed(2)}
                                        </div>
                                    </div>
                                    <p className="text-label-sm font-label-sm text-secondary mt-stack-sm flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                        Ready for instant payout
                                    </p>
                                    <button 
                                        onClick={handleCashOut}
                                        disabled={cashOutState !== 'default'}
                                        className={`mt-stack-lg w-full py-4 rounded-lg font-label-bold text-label-bold flex items-center justify-center gap-stack-sm transition-all ${
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
                            <section className="bg-surface-container border border-outline-variant rounded-xl p-stack-lg">
                                <h3 className="font-headline-md text-headline-md mb-stack-md">Earnings Breakdown</h3>
                                <div className="space-y-stack-md">
                                    <div className="flex justify-between items-center py-stack-sm border-b border-outline-variant/30">
                                        <div className="flex items-center gap-stack-sm">
                                            <span className="material-symbols-outlined text-on-surface-variant">delivery_dining</span>
                                            <span className="font-body-md text-body-md">Base Pay</span>
                                        </div>
                                        <span className="font-label-bold text-label-bold text-on-background">€{earnings.basePay.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                                        <span className="text-on-surface-variant font-body-md text-body-md flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-secondary"></span>
                                            Tips
                                        </span>
                                        <span className="font-label-bold text-label-bold text-on-background">€{earnings.tips.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                                        <span className="text-on-surface-variant font-body-md text-body-md flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full bg-tertiary"></span>
                                            Surge & Incentives
                                        </span>
                                        <span className="font-label-bold text-label-bold text-on-background">€{earnings.incentives.toFixed(2)}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Stats Quick View */}
                            <div className="grid grid-cols-2 gap-gutter">
                                <div className="bg-surface-container-high border border-outline-variant rounded-xl p-stack-lg h-full flex flex-col justify-between group hover:border-primary/30 transition-colors">
                                    <div>
                                        <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Deliveries</span>
                                        <div className="font-display-earnings text-display-earnings text-on-surface mt-2">{earnings.totalDeliveries}</div>
                                    </div>
                                    <span className="material-symbols-outlined text-4xl text-primary opacity-50 group-hover:scale-110 transition-transform self-end">local_shipping</span>
                                </div>
                                <div className="bg-surface-container-high border border-outline-variant rounded-xl p-stack-lg h-full flex flex-col justify-between group hover:border-secondary/30 transition-colors">
                                    <div>
                                        <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Online Time</span>
                                        <div className="font-display-earnings text-display-earnings text-on-surface mt-2">{earnings.hoursOnline.toFixed(1)}h</div>
                                    </div>
                                    <span className="material-symbols-outlined text-4xl text-secondary opacity-50 group-hover:scale-110 transition-transform self-end">schedule</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Graph & History */}
                        <div className="md:col-span-12 lg:col-span-8 space-y-gutter lg:space-y-stack-lg">
                            {/* Weekly Earnings Graph */}
                            <section className="bg-surface-container-high border border-outline-variant rounded-xl p-stack-lg">
                                <div className="flex justify-between items-center mb-stack-lg">
                                    <div>
                                        <h3 className="font-headline-md text-headline-md">Weekly Performance</h3>
                                        <p className="text-label-sm font-label-sm text-on-surface-variant">Oct 14 - Oct 20</p>
                                    </div>
                                    <div className="flex gap-2 bg-surface-container-low p-1 rounded-lg">
                                        <button className="px-3 py-1 text-label-sm font-label-bold bg-primary-container text-on-primary-container rounded-md">Weekly</button>
                                        <button className="px-3 py-1 text-label-sm font-label-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors rounded-md">Daily</button>
                                    </div>
                                </div>
                                
                                {/* Visual Graph */}
                                <div className="h-64 flex items-end justify-between px-2 pt-8 gap-stack-sm border-b border-outline-variant">
                                    <div className="flex-1 group flex flex-col items-center">
                                        <div className="w-full bg-primary/20 rounded-t-sm chart-bar-transition group-hover:bg-primary/40 relative" style={{ height: chartHeights.mon }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface-container-highest text-label-sm px-2 py-1 rounded transition-opacity">$42</div>
                                        </div>
                                        <span className="text-label-sm font-label-sm mt-stack-sm text-on-surface-variant">M</span>
                                    </div>
                                    <div className="flex-1 group flex flex-col items-center">
                                        <div className="w-full bg-primary/20 rounded-t-sm chart-bar-transition group-hover:bg-primary/40 relative" style={{ height: chartHeights.tue }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface-container-highest text-label-sm px-2 py-1 rounded transition-opacity">$68</div>
                                        </div>
                                        <span className="text-label-sm font-label-sm mt-stack-sm text-on-surface-variant">T</span>
                                    </div>
                                    <div className="flex-1 group flex flex-col items-center">
                                        <div className="w-full bg-primary/20 rounded-t-sm chart-bar-transition group-hover:bg-primary/40 relative" style={{ height: chartHeights.wed }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface-container-highest text-label-sm px-2 py-1 rounded transition-opacity">$55</div>
                                        </div>
                                        <span className="text-label-sm font-label-sm mt-stack-sm text-on-surface-variant">W</span>
                                    </div>
                                    <div className="flex-1 group flex flex-col items-center">
                                        <div className="w-full bg-primary rounded-t-sm chart-bar-transition group-hover:brightness-110 relative" style={{ height: chartHeights.thu }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface-container-highest text-label-sm px-2 py-1 rounded transition-opacity">$92</div>
                                        </div>
                                        <span className="text-label-sm font-label-sm mt-stack-sm text-on-surface-variant">T</span>
                                    </div>
                                    <div className="flex-1 group flex flex-col items-center">
                                        <div className="w-full bg-primary/20 rounded-t-sm chart-bar-transition group-hover:bg-primary/40 relative" style={{ height: chartHeights.fri }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface-container-highest text-label-sm px-2 py-1 rounded transition-opacity">$80</div>
                                        </div>
                                        <span className="text-label-sm font-label-sm mt-stack-sm text-on-surface-variant">F</span>
                                    </div>
                                    <div className="flex-1 group flex flex-col items-center">
                                        <div className="w-full bg-primary/20 rounded-t-sm chart-bar-transition group-hover:bg-primary/40 relative" style={{ height: chartHeights.sat }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface-container-highest text-label-sm px-2 py-1 rounded transition-opacity">$38</div>
                                        </div>
                                        <span className="text-label-sm font-label-sm mt-stack-sm text-on-surface-variant">S</span>
                                    </div>
                                    <div className="flex-1 group flex flex-col items-center">
                                        <div className="w-full bg-primary/20 rounded-t-sm chart-bar-transition group-hover:bg-primary/40 relative" style={{ height: chartHeights.sun }}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface-container-highest text-label-sm px-2 py-1 rounded transition-opacity">$28</div>
                                        </div>
                                        <span className="text-label-sm font-label-sm mt-stack-sm text-on-surface-variant">S</span>
                                    </div>
                                </div>
                            </section>

                            {/* Payout History */}
                            <section className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
                                <div className="p-stack-lg border-b border-outline-variant flex justify-between items-center">
                                    <h3 className="font-headline-md text-headline-md">Payout History</h3>
                                    <button className="text-primary font-label-bold text-label-bold flex items-center gap-1 hover:underline">
                                        View Statement
                                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                    </button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center justify-between p-stack-lg hover:bg-surface-container-high transition-colors border-b border-outline-variant/30">
                                        <div className="flex items-center gap-stack-md">
                                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                                <span className="material-symbols-outlined">account_balance</span>
                                            </div>
                                            <div>
                                                <p className="font-label-bold text-label-bold">Bank Transfer • **** 4291</p>
                                                <p className="text-label-sm font-label-sm text-on-surface-variant">Completed • Oct 15, 2023</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-label-bold text-label-bold">$342.15</p>
                                            <span className="text-[10px] uppercase font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded">Paid</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-stack-lg hover:bg-surface-container-high transition-colors border-b border-outline-variant/30">
                                        <div className="flex items-center gap-stack-md">
                                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                                <span className="material-symbols-outlined">account_balance</span>
                                            </div>
                                            <div>
                                                <p className="font-label-bold text-label-bold">Bank Transfer • **** 4291</p>
                                                <p className="text-label-sm font-label-sm text-on-surface-variant">Completed • Oct 08, 2023</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-label-bold text-label-bold">$410.50</p>
                                            <span className="text-[10px] uppercase font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded">Paid</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-stack-lg hover:bg-surface-container-high transition-colors border-b border-outline-variant/30">
                                        <div className="flex items-center gap-stack-md">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined">bolt</span>
                                            </div>
                                            <div>
                                                <p className="font-label-bold text-label-bold">Instant Payout</p>
                                                <p className="text-label-sm font-label-sm text-on-surface-variant">Completed • Oct 03, 2023</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-label-bold text-label-bold">$85.00</p>
                                            <span className="text-[10px] uppercase font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded">Paid</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-stack-lg hover:bg-surface-container-high transition-colors">
                                        <div className="flex items-center gap-stack-md">
                                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                                <span className="material-symbols-outlined">account_balance</span>
                                            </div>
                                            <div>
                                                <p className="font-label-bold text-label-bold">Bank Transfer • **** 4291</p>
                                                <p className="text-label-sm font-label-sm text-on-surface-variant">Completed • Sep 24, 2023</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-label-bold text-label-bold">$388.20</p>
                                            <span className="text-[10px] uppercase font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded">Paid</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>

            {/* BottomNavBar (Mobile Only) */}
            <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-outline-variant flex justify-around items-center px-2 pb-4 pt-2 lg:hidden">
                <Link to="/rider/dashboard" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:bg-surface-container-highest transition-transform scale-95 duration-150">
                    <span className="material-symbols-outlined">home</span>
                    <span className="font-label-sm text-label-sm-mobile">Home</span>
                </Link>
                <Link to="/rider/active-deliveries" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:bg-surface-container-highest transition-transform scale-95 duration-150">
                    <span className="material-symbols-outlined">list_alt</span>
                    <span className="font-label-sm text-label-sm-mobile">Tasks</span>
                </Link>
                <Link to="/rider/earnings" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 transition-transform scale-95 duration-150">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                    <span className="font-label-sm text-label-sm-mobile">Earnings</span>
                </Link>
                <button className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:bg-surface-container-highest transition-transform scale-95 duration-150">
                    <span className="material-symbols-outlined">person</span>
                    <span className="font-label-sm text-label-sm-mobile">Profile</span>
                </button>
            </nav>
        </div>
    );
};

export default Earnings;
