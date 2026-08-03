import React, { useEffect } from 'react';
import RiderBottomNav from '../../../../components/userDashboardComponents/RiderBottomNav';
import RiderHeader from '../../../../components/userDashboardComponents/RiderHeader';
import RiderSidebar from '../../../../components/userDashboardComponents/RiderSidebar';
import RiderProfileDropdown from '../../../../components/userDashboardComponents/RiderProfileDropdown';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardThunk, updateRiderStatusThunk, fetchRiderProfileThunk } from '../../../../redux/riderSlice';

const RiderDashboard = () => {
    const dispatch = useDispatch();
    const { profile, dashboard, loading, error } = useSelector((state) => state.rider);

    useEffect(() => {
        dispatch(fetchRiderProfileThunk());
        dispatch(fetchDashboardThunk());
    }, [dispatch]);

    const handleGoOnline = () => {
        const newStatus = profile?.status === 'Available' ? 'Offline' : 'Available';
        dispatch(updateRiderStatusThunk(newStatus));
    };

    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-primary"><span className="material-symbols-outlined animate-spin text-4xl">sync</span></div>;
    }

    if (error || !profile || !dashboard) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-error space-y-4 p-4 text-center">
                <span className="material-symbols-outlined text-6xl">error</span>
                <p className="font-inter text-xl font-semibold leading-7 text-on-background">Failed to load dashboard.</p>
                <p className="text-label-md text-error bg-error/10 p-3 rounded-lg border border-error/20 max-w-md">{error || 'Unknown error occurred while fetching data.'}</p>
                <button 
                    onClick={() => {
                        dispatch(fetchRiderProfileThunk());
                        dispatch(fetchDashboardThunk());
                    }} 
                    className="px-6 py-2 bg-primary text-white rounded-lg font-label-bold mt-4 hover:bg-primary/90 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="font-inter text-on-background overflow-x-hidden min-h-screen bg-background">
            <RiderHeader profile={profile} showStatusToggle={true} />

            <RiderSidebar activeTab="dashboard" />

            {/* Main Content Area */}
            <main className="lg:ml-64 pt-20 pb-24 lg:pb-8 px-4 min-h-screen">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Summary Metrics Bento Grid */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-surface-container-high border border-outline-variant p-4 rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-inter text-xs font-bold leading-4 text-on-surface-variant uppercase tracking-wider">Today's Earnings</span>
                                <span className="text-secondary material-symbols-outlined">payments</span>
                            </div>
                            <div className="font-inter text-[40px] font-bold leading-[48px] tracking-tight text-on-surface">€{dashboard?.metrics?.todayEarnings?.toFixed(2) || '0.00'}</div>
                            <div className="mt-2 flex items-center gap-1">
                                <span className="text-secondary text-label-bold font-label-bold">+12% vs yesterday</span>
                            </div>
                        </div>
                        <div className="bg-surface-container-high border border-outline-variant p-4 rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-inter text-xs font-bold leading-4 text-on-surface-variant uppercase tracking-wider">Deliveries</span>
                                <span className="text-primary material-symbols-outlined">local_shipping</span>
                            </div>
                            <div className="font-inter text-[40px] font-bold leading-[48px] tracking-tight text-on-surface">{dashboard?.metrics?.totalDeliveries || 0}</div>
                            <div className="mt-2 text-label-bold font-label-bold text-on-surface-variant">4 remaining in shift</div>
                        </div>
                        <div className="bg-surface-container-high border border-outline-variant p-4 rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-inter text-xl font-semibold leading-7 text-primary flex items-center gap-1">
                                {dashboard?.metrics?.rating || '4.9'} <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                </h3>
                                <p className="text-label-sm text-on-surface-variant uppercase">Overall Rating</p>
                            </div>
                            <div className="mt-2 text-label-bold font-label-bold text-on-surface-variant">Top 5% in Berlin</div>
                        </div>
                        <div className="bg-surface-container-high border border-outline-variant p-4 rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-inter text-xs font-bold leading-4 text-on-surface-variant uppercase tracking-wider">Online Time</span>
                                <span className="text-tertiary material-symbols-outlined">schedule</span>
                            </div>
                            <div className="font-inter text-[40px] font-bold leading-[48px] tracking-tight text-on-surface">{dashboard?.metrics?.onlineTime || '0h 0m'}</div>
                            <div className="mt-2 text-label-bold font-label-bold text-on-surface-variant">Break scheduled in 48m</div>
                        </div>
                    </section>

                    {/* Main Interactive Section */}
                    <div className="grid lg:grid-cols-12 gap-3">
                        {/* Left: Active Delivery & Chart */}
                        <div className="lg:col-span-8 space-y-3">
                            {/* Active Delivery Card */}
                            {dashboard.activeOrder ? (
                                <div className="bg-surface-container-high rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline-variant/50">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined">fastfood</span>
                                        </div>
                                        <div>
                                            <h4 className="font-inter text-xs font-bold leading-4 text-on-surface">Order #{dashboard?.activeOrder?._id?.toString()?.slice(-4)?.toUpperCase() || 'ID'}</h4>
                                            <p className="font-inter text-sm font-normal leading-5 text-on-surface-variant">{dashboard.activeOrder.restaurant?.name || 'Restaurant'}</p>
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
                                        <Link to="/rider/active-deliveries" className="px-4 py-2 bg-primary text-white rounded-lg font-inter text-xs font-bold leading-4 hover:bg-primary/90 transition-colors text-center">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-surface-container-high rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-outline-variant/50 min-h-[160px]">
                                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">inbox</span>
                                    <p className="font-inter text-sm font-normal leading-5 text-on-surface-variant">No active orders right now.</p>
                                    <p className="text-label-sm text-on-surface-variant/70">You will be notified when a new order is assigned to you.</p>
                                </div>
                            )}

                            {/* Earnings Performance Chart */}
                            <div className="bg-surface-container-high border border-outline-variant rounded-xl p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-inter text-xl font-semibold leading-7-mobile text-headline-md-mobile font-bold text-on-surface">Hello, {profile.name}</h2>
                                    <span className={`px-2 py-1 ${profile.status === 'Available' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface-variant'} rounded-md font-inter text-[11px] font-medium leading-[14px] flex items-center gap-1`}>
                                        <div className={`w-2 h-2 ${profile.status === 'Available' ? 'bg-secondary' : 'bg-on-surface-variant'} rounded-full`}></div>
                                        {profile.status}
                                    </span>
                                    <select className="bg-transparent border-none font-inter text-xs font-bold leading-4 text-on-surface-variant focus:ring-0">
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
                                <div className="p-4 border-b border-outline-variant flex justify-between items-center">
                                    <h3 className="font-inter text-xl font-semibold leading-7">Recent</h3>
                                    <button className="text-primary font-inter text-xs font-bold leading-4 hover:underline">View All</button>
                                </div>
                                <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    <div className="p-4 border-b border-outline-variant hover:bg-surface-container transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-inter text-xs font-bold leading-4">#4428 • Delivered</span>
                                            <span className="text-secondary font-inter text-xs font-bold leading-4">€7.20</span>
                                        </div>
                                        <p className="font-inter text-sm font-normal leading-5 text-on-surface-variant">Cocolo Ramen X-berg</p>
                                        <p className="font-inter text-[11px] font-medium leading-[14px] text-on-surface-variant/60 mt-1">14:22 • 2.4 km</p>
                                    </div>
                                    <div className="p-4 border-b border-outline-variant hover:bg-surface-container transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-inter text-xs font-bold leading-4">#4427 • Delivered</span>
                                            <span className="text-secondary font-inter text-xs font-bold leading-4">€12.50</span>
                                        </div>
                                        <p className="font-inter text-sm font-normal leading-5 text-on-surface-variant">Mustafa's Gemuse Kebab</p>
                                        <p className="font-inter text-[11px] font-medium leading-[14px] text-on-surface-variant/60 mt-1">13:45 • 4.1 km</p>
                                    </div>
                                    <div className="p-4 border-b border-outline-variant hover:bg-surface-container transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-inter text-xs font-bold leading-4">#4426 • Delivered</span>
                                            <span className="text-secondary font-inter text-xs font-bold leading-4">€6.80</span>
                                        </div>
                                        <p className="font-inter text-sm font-normal leading-5 text-on-surface-variant">Angry Chicken</p>
                                        <p className="font-inter text-[11px] font-medium leading-[14px] text-on-surface-variant/60 mt-1">13:10 • 1.2 km</p>
                                    </div>
                                    <div className="p-4 border-b border-outline-variant hover:bg-surface-container transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-inter text-xs font-bold leading-4">#4425 • Delivered</span>
                                            <span className="text-secondary font-inter text-xs font-bold leading-4">€9.10</span>
                                        </div>
                                        <p className="font-inter text-sm font-normal leading-5 text-on-surface-variant">Vöner</p>
                                        <p className="font-inter text-[11px] font-medium leading-[14px] text-on-surface-variant/60 mt-1">12:30 • 3.5 km</p>
                                    </div>
                                    <div className="p-4 hover:bg-surface-container transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-inter text-xs font-bold leading-4">#4424 • Delivered</span>
                                            <span className="text-secondary font-inter text-xs font-bold leading-4">€8.30</span>
                                        </div>
                                        <p className="font-inter text-sm font-normal leading-5 text-on-surface-variant">Umami X-berg</p>
                                        <p className="font-inter text-[11px] font-medium leading-[14px] text-on-surface-variant/60 mt-1">12:05 • 2.8 km</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-surface-container mt-auto">
                                    <div className="bg-secondary-container/10 p-2 rounded border border-secondary-container/20 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-secondary">info</span>
                                        <p className="text-label-sm text-secondary font-label-bold">High demand in your area. +€1.50 per delivery active.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <RiderBottomNav activeTab="dashboard" />
        </div>
    );
};

export default RiderDashboard;
