import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardThunk, updateRiderStatusThunk, fetchRiderProfileThunk } from '../../features/rider/riderSlice';
import './RiderTheme.css';

const RiderDashboard = () => {
    const dispatch = useDispatch();
    const { profile, dashboard, loading } = useSelector((state) => state.rider);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchRiderProfileThunk());
        dispatch(fetchDashboardThunk());
    }, [dispatch]);

    const handleGoOnline = () => {
        const newStatus = profile?.status === 'Available' ? 'Offline' : 'Available';
        dispatch(updateRiderStatusThunk(newStatus));
    };

    if (loading || !profile || !dashboard) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-primary"><span className="material-symbols-outlined animate-spin text-4xl">sync</span></div>;
    }

    return (
        <div className="rider-theme text-on-background overflow-x-hidden min-h-screen bg-background dark">
            {/* Top Navigation Bar (Mobile & Desktop) */}
            <nav className="fixed top-0 w-full z-50 bg-background border-b border-outline-variant flex justify-between items-center px-container-margin py-stack-sm">
                <div className="flex items-center gap-4">
                    <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">Foodora Rider</span>
                </div>
                <div className="flex items-center gap-stack-md">
                    <div className="hidden md:flex items-center gap-2 bg-surface-container rounded-full px-4 py-1.5 border border-outline-variant">
                        <span className={`material-symbols-outlined ${profile.status === 'Available' ? 'text-secondary' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            fiber_manual_record
                        </span>
                        <span className="font-label-bold text-label-bold text-on-surface">
                            {profile.status === 'Available' ? 'GO OFFLINE' : 'GO ONLINE'}
                        </span>
                        <button 
                            onClick={handleGoOnline}
                            className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${profile.status === 'Available' ? 'bg-secondary-container' : 'bg-outline'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${profile.status === 'Available' ? 'right-0.5' : 'left-0.5'}`}></div>
                        </button>
                    </div>
                    <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors duration-200">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-outline">
                        <img 
                            className="w-full h-full object-cover" 
                            alt="Rider avatar" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDd8qT0mJdRhqlGl8fps7m-6X1GxAigqkHIpM7C0ZTXZq_ijtn9CnXPUA4q9K3gv-a-xUYLWalnG4M9LJn2klX2w_hzpQQmyVhg_M9rT17HxfwXFybJNMY1YW_Px5hEg-QmzjoQKnYHt6NSyvyfZI-81jTd5fLXuDcpkKqo6uE-vLt2omLuiiiP2Y8uedoqhslfxzv2eoDSc84DmOphH5lbVWilj_oXQ5iy-QJk778IwHUhGhgrEvNnig" 
                        />
                    </div>
                </div>
            </nav>

            {/* Sidebar Navigation (Desktop Only) */}
            <aside className="fixed left-0 top-0 h-full w-64 hidden lg:flex flex-col bg-surface border-r border-outline-variant z-40 py-stack-lg pt-20">
                <div className="px-6 mb-8">
                    <h2 className="font-headline-md text-headline-md font-bold text-primary">Rider Dashboard</h2>
                    <p className="text-label-bold font-label-bold text-on-surface-variant opacity-60">Utility Logistics</p>
                </div>
                <nav className="flex-grow flex flex-col px-3 gap-1">
                    <Link to="/rider/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold border-l-4 border-primary bg-surface-container-high transition-transform active:scale-95">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                        <span className="font-label-bold text-label-bold">Overview</span>
                    </Link>
                    <Link to="/rider/active-deliveries" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95">
                        <span className="material-symbols-outlined">local_shipping</span>
                        <span className="font-label-bold text-label-bold">Active Deliveries</span>
                    </Link>
                    <Link to="/rider/earnings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95">
                        <span className="material-symbols-outlined">payments</span>
                        <span className="font-label-bold text-label-bold">Earnings</span>
                    </Link>
                    <Link to="/rider/ratings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95">
                        <span className="material-symbols-outlined">star</span>
                        <span className="font-label-bold text-label-bold">Ratings</span>
                    </Link>
                    <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95" href="#">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="font-label-bold text-label-bold">Settings</span>
                    </a>
                </nav>
                <div className="px-3 border-t border-outline-variant pt-4">
                    <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95" href="#">
                        <span className="material-symbols-outlined">help</span>
                        <span className="font-label-bold text-label-bold">Help Center</span>
                    </a>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:ml-64 pt-20 pb-24 lg:pb-8 px-container-margin min-h-screen">
                <div className="max-w-7xl mx-auto space-y-stack-lg">
                    {/* Summary Metrics Bento Grid */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
                        <div className="bg-surface-container-high border border-outline-variant p-stack-md rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Today's Earnings</span>
                                <span className="text-secondary material-symbols-outlined">payments</span>
                            </div>
                            <div className="font-display-earnings text-display-earnings text-on-surface">€{dashboard.metrics.todayEarnings.toFixed(2)}</div>
                            <div className="mt-2 flex items-center gap-1">
                                <span className="text-secondary text-label-bold font-label-bold">+12% vs yesterday</span>
                            </div>
                        </div>
                        <div className="bg-surface-container-high border border-outline-variant p-stack-md rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Deliveries</span>
                                <span className="text-primary material-symbols-outlined">local_shipping</span>
                            </div>
                            <div className="font-display-earnings text-display-earnings text-on-surface">{dashboard.metrics.totalDeliveries}</div>
                            <div className="mt-2 text-label-bold font-label-bold text-on-surface-variant">4 remaining in shift</div>
                        </div>
                        <div className="bg-surface-container-high border border-outline-variant p-stack-md rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-1">
                                {dashboard.metrics.rating} <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                </h3>
                                <p className="text-label-sm text-on-surface-variant uppercase">Overall Rating</p>
                            </div>
                            <div className="mt-2 text-label-bold font-label-bold text-on-surface-variant">Top 5% in Berlin</div>
                        </div>
                        <div className="bg-surface-container-high border border-outline-variant p-stack-md rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">Online Time</span>
                                <span className="text-tertiary material-symbols-outlined">schedule</span>
                            </div>
                            <div className="font-display-earnings text-display-earnings text-on-surface">{dashboard.metrics.onlineTime}</div>
                            <div className="mt-2 text-label-bold font-label-bold text-on-surface-variant">Break scheduled in 48m</div>
                        </div>
                    </section>

                    {/* Main Interactive Section */}
                    <div className="grid lg:grid-cols-12 gap-gutter">
                        {/* Left: Active Delivery & Chart */}
                        <div className="lg:col-span-8 space-y-gutter">
                            {/* Active Delivery Card */}
                            {dashboard.activeOrder ? (
                                <div className="bg-surface-container-high rounded-xl p-stack-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline-variant/50">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined">fastfood</span>
                                        </div>
                                        <div>
                                            <h4 className="font-label-bold text-label-bold text-on-surface">Order #{dashboard.activeOrder._id.toString().slice(-4).toUpperCase()}</h4>
                                            <p className="font-body-md text-body-md text-on-surface-variant">{dashboard.activeOrder.restaurant?.name || 'Restaurant'}</p>
                                            <div className="flex items-center gap-1 mt-1 text-secondary">
                                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                <span className="text-small">{dashboard.activeOrder.deliveryAddress?.streetAddress || 'Delivery Address'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:items-end gap-2">
                                        <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-label-sm font-label-bold">
                                            {dashboard.activeOrder.status}
                                        </span>
                                        <Link to="/rider/active-deliveries" className="px-4 py-2 bg-primary text-white rounded-lg font-label-bold text-label-bold hover:bg-primary/90 transition-colors text-center">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-surface-container-high rounded-xl p-stack-md flex flex-col items-center justify-center gap-2 border border-outline-variant/50 min-h-[160px]">
                                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">inbox</span>
                                    <p className="font-body-md text-body-md text-on-surface-variant">No active orders right now.</p>
                                    <p className="text-label-sm text-on-surface-variant/70">You will be notified when a new order is assigned to you.</p>
                                </div>
                            )}

                            {/* Earnings Performance Chart */}
                            <div className="bg-surface-container-high border border-outline-variant rounded-xl p-stack-lg">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-headline-md-mobile text-headline-md-mobile font-bold text-on-surface">Hello, {profile.name}</h2>
                                    <span className={`px-2 py-1 ${profile.status === 'Available' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface-variant'} rounded-md font-label-sm text-label-sm flex items-center gap-1`}>
                                        <div className={`w-2 h-2 ${profile.status === 'Available' ? 'bg-secondary' : 'bg-on-surface-variant'} rounded-full`}></div>
                                        {profile.status}
                                    </span>
                                    <select className="bg-transparent border-none font-label-bold text-label-bold text-on-surface-variant focus:ring-0">
                                        <option>Weekly</option>
                                        <option>Monthly</option>
                                    </select>
                                </div>
                                <div className="h-64 flex items-end justify-between gap-2 pt-4">
                                    <div className="flex-grow flex flex-col items-center gap-3">
                                        <div className="w-full bg-primary-container/20 rounded-t-lg relative group h-32">
                                            <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-[60%] transition-all duration-500 hover:h-[65%]"></div>
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-surface p-1 rounded border border-outline-variant text-[10px]">€92</div>
                                        </div>
                                        <span className="font-label-bold text-[10px] text-on-surface-variant">MON</span>
                                    </div>
                                    <div className="flex-grow flex flex-col items-center gap-3">
                                        <div className="w-full bg-primary-container/20 rounded-t-lg relative group h-32">
                                            <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-[85%] transition-all duration-500"></div>
                                        </div>
                                        <span className="font-label-bold text-[10px] text-on-surface-variant">TUE</span>
                                    </div>
                                    <div className="flex-grow flex flex-col items-center gap-3">
                                        <div className="w-full bg-primary-container/20 rounded-t-lg relative group h-32">
                                            <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-[45%] transition-all duration-500"></div>
                                        </div>
                                        <span className="font-label-bold text-[10px] text-on-surface-variant">WED</span>
                                    </div>
                                    <div className="flex-grow flex flex-col items-center gap-3">
                                        <div className="w-full bg-primary-container/20 rounded-t-lg relative group h-32">
                                            <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-[95%] transition-all duration-500"></div>
                                        </div>
                                        <span className="font-label-bold text-[10px] text-on-surface-variant">THU</span>
                                    </div>
                                    <div className="flex-grow flex flex-col items-center gap-3">
                                        <div className="w-full bg-primary-container/20 rounded-t-lg relative group h-32">
                                            <div className="absolute bottom-0 w-full bg-primary rounded-t-lg h-[75%] transition-all duration-500"></div>
                                        </div>
                                        <span className="font-label-bold text-[10px] text-on-surface-variant">FRI</span>
                                    </div>
                                    <div className="flex-grow flex flex-col items-center gap-3">
                                        <div className="w-full bg-primary-container/20 rounded-t-lg relative group h-32">
                                            <div className="absolute bottom-0 w-full bg-secondary-container rounded-t-lg h-full animate-pulse"></div>
                                        </div>
                                        <span className="font-label-bold text-[10px] text-secondary">TOD</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Recent Deliveries */}
                        <div className="lg:col-span-4">
                            <div className="bg-surface-container-high border border-outline-variant rounded-xl flex flex-col h-full">
                                <div className="p-stack-md border-b border-outline-variant flex justify-between items-center">
                                    <h3 className="font-headline-md text-headline-md">Recent</h3>
                                    <button className="text-primary font-label-bold text-label-bold hover:underline">View All</button>
                                </div>
                                <div className="flex-grow overflow-y-auto hide-scrollbar">
                                    <div className="p-stack-md border-b border-outline-variant hover:bg-surface-container transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-label-bold text-label-bold">#4428 • Delivered</span>
                                            <span className="text-secondary font-label-bold text-label-bold">€7.20</span>
                                        </div>
                                        <p className="font-body-md text-body-md text-on-surface-variant">Cocolo Ramen X-berg</p>
                                        <p className="font-label-sm text-label-sm text-on-surface-variant/60 mt-1">14:22 • 2.4 km</p>
                                    </div>
                                    <div className="p-stack-md border-b border-outline-variant hover:bg-surface-container transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-label-bold text-label-bold">#4427 • Delivered</span>
                                            <span className="text-secondary font-label-bold text-label-bold">€12.50</span>
                                        </div>
                                        <p className="font-body-md text-body-md text-on-surface-variant">Mustafa's Gemuse Kebab</p>
                                        <p className="font-label-sm text-label-sm text-on-surface-variant/60 mt-1">13:45 • 4.1 km</p>
                                    </div>
                                    <div className="p-stack-md border-b border-outline-variant hover:bg-surface-container transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-label-bold text-label-bold">#4426 • Delivered</span>
                                            <span className="text-secondary font-label-bold text-label-bold">€6.80</span>
                                        </div>
                                        <p className="font-body-md text-body-md text-on-surface-variant">Angry Chicken</p>
                                        <p className="font-label-sm text-label-sm text-on-surface-variant/60 mt-1">13:10 • 1.2 km</p>
                                    </div>
                                    <div className="p-stack-md border-b border-outline-variant hover:bg-surface-container transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-label-bold text-label-bold">#4425 • Delivered</span>
                                            <span className="text-secondary font-label-bold text-label-bold">€9.10</span>
                                        </div>
                                        <p className="font-body-md text-body-md text-on-surface-variant">Vöner</p>
                                        <p className="font-label-sm text-label-sm text-on-surface-variant/60 mt-1">12:30 • 3.5 km</p>
                                    </div>
                                    <div className="p-stack-md hover:bg-surface-container transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-label-bold text-label-bold">#4424 • Delivered</span>
                                            <span className="text-secondary font-label-bold text-label-bold">€8.30</span>
                                        </div>
                                        <p className="font-body-md text-body-md text-on-surface-variant">Umami X-berg</p>
                                        <p className="font-label-sm text-label-sm text-on-surface-variant/60 mt-1">12:05 • 2.8 km</p>
                                    </div>
                                </div>
                                <div className="p-stack-md bg-surface-container mt-auto">
                                    <div className="bg-secondary-container/10 p-stack-sm rounded border border-secondary-container/20 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-secondary">info</span>
                                        <p className="text-label-sm text-secondary font-label-bold">High demand in your area. +€1.50 per delivery active.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* BottomNavBar (Mobile Only) */}
            <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-outline-variant flex justify-around items-center px-2 pb-4 pt-2 lg:hidden shadow-lg">
                <Link to="/rider/dashboard" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 transition-transform scale-95 duration-150">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                    <span className="font-label-sm text-label-sm-mobile">Home</span>
                </Link>
                <Link to="/rider/active-deliveries" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:bg-surface-container-highest transition-transform scale-95 duration-150">
                    <span className="material-symbols-outlined">list_alt</span>
                    <span className="font-label-sm text-label-sm-mobile">Tasks</span>
                </Link>
                <Link to="/rider/earnings" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:bg-surface-container-highest transition-transform scale-95 duration-150">
                    <span className="material-symbols-outlined">payments</span>
                    <span className="font-label-sm text-label-sm-mobile">Earnings</span>
                </Link>
                <a className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:bg-surface-container-highest transition-transform scale-95 duration-150" href="#">
                    <span className="material-symbols-outlined">person</span>
                    <span className="font-label-sm text-label-sm-mobile">Profile</span>
                </a>
            </nav>
        </div>
    );
};

export default RiderDashboard;
