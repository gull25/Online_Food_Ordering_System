import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPerformanceThunk } from '../../features/rider/riderSlice';
import './RiderTheme.css';

const Ratings = () => {
    const dispatch = useDispatch();
    const { performance, loading } = useSelector((state) => state.rider);

    useEffect(() => {
        dispatch(fetchPerformanceThunk());
    }, [dispatch]);

    if (loading || !performance) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-primary"><span className="material-symbols-outlined animate-spin text-4xl">sync</span></div>;
    }

    return (
        <div className="rider-theme bg-background text-on-background min-h-screen dark">
            {/* TopAppBar */}
            <header className="fixed top-0 w-full z-50 bg-background border-b border-outline-variant flex justify-between items-center px-container-margin py-stack-sm lg:hidden">
                <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">Foodora Rider</h1>
                <div className="flex items-center gap-stack-md">
                    <span className="material-symbols-outlined text-primary">notifications</span>
                    <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden border border-outline-variant">
                        <img 
                            className="w-full h-full object-cover" 
                            alt="Rider avatar" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCw1XNmxcw88lViWDjqB0rcCAjlYmFObabunl1dJneWgUPthU6qivCqp7rIqEiNxzj8l_kuKq8eiTzSR3kPuF1fas5ADcBLrSdRV4MYokDA_z3kvbpYj8UVG9jo8h9XvkTpTnC815B1YDsVbf2e0P6EYx3E5HjJwEhec-131_hErbrPLXxy_cTzMPGPg2rF3vnXdWpv-wKAZGVRqlS4d6jB0IxlPg1U5zZK0WZEDE78OGvnbQCN6UuFg" 
                        />
                    </div>
                </div>
            </header>

            {/* SideNavBar (Desktop Only) */}
            <aside className="fixed left-0 top-0 h-full w-64 hidden lg:flex flex-col bg-surface border-r border-outline-variant py-stack-lg">
                <div className="px-6 mb-stack-lg">
                    <h1 className="font-headline-md text-headline-md font-bold text-primary">Rider Dashboard</h1>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Utility Logistics</p>
                </div>
                <nav className="flex-1 flex flex-col">
                    <Link to="/rider/dashboard" className="flex items-center px-6 py-3 text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200">
                        <span className="material-symbols-outlined mr-4">dashboard</span>
                        <span className="font-label-bold text-label-bold">Overview</span>
                    </Link>
                    <Link to="/rider/active-deliveries" className="flex items-center px-6 py-3 text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200">
                        <span className="material-symbols-outlined mr-4">local_shipping</span>
                        <span className="font-label-bold text-label-bold">Active Deliveries</span>
                    </Link>
                    <Link to="/rider/earnings" className="flex items-center px-6 py-3 text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200">
                        <span className="material-symbols-outlined mr-4">payments</span>
                        <span className="font-label-bold text-label-bold">Earnings</span>
                    </Link>
                    <Link to="/rider/ratings" className="flex items-center px-6 py-3 text-primary font-bold border-l-4 border-primary bg-surface-container-high transition-colors duration-200">
                        <span className="material-symbols-outlined mr-4" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-label-bold text-label-bold">Ratings</span>
                    </Link>
                    <a className="flex items-center px-6 py-3 text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200" href="#">
                        <span className="material-symbols-outlined mr-4">settings</span>
                        <span className="font-label-bold text-label-bold">Settings</span>
                    </a>
                </nav>
                <div className="px-6 mt-auto">
                    <button className="w-full py-3 bg-primary-container text-on-primary-container font-label-bold text-label-bold rounded-lg active:scale-95 transition-transform mb-4">
                        GO ONLINE
                    </button>
                    <a className="flex items-center text-on-surface-variant hover:text-primary py-2" href="#">
                        <span className="material-symbols-outlined mr-2">help</span>
                        <span className="font-label-bold text-label-bold">Help Center</span>
                    </a>
                </div>
            </aside>

            {/* Main Content Canvas */}
            <main className="pt-20 lg:pt-8 pb-24 lg:pl-72 lg:pr-8 px-container-margin">
                {/* Header Section */}
                <div className="mb-stack-lg">
                    <h2 className="font-headline-lg text-headline-lg text-on-background mb-1">Performance & Ratings</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">Your journey as a top-tier rider. Keep it up!</p>
                </div>

                {/* Grid Layout: Bento-style */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                    {/* Overall Rating Card */}
                    <div className="md:col-span-4 bg-surface-container border border-outline-variant rounded-xl p-stack-md flex flex-col items-center justify-center text-center">
                        <p className="font-label-bold text-label-bold text-on-surface-variant uppercase mb-2">Overall Rating</p>
                        <div className="font-display-earnings text-display-earnings text-primary flex items-center justify-center gap-2">
                            {performance.overallRating}
                            <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        </div>
                        <div className="w-full space-y-2 mt-4">
                            <div className="flex items-center gap-2">
                                <span className="font-label-bold text-label-bold w-4">5</span>
                                <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${performance.ratingDistribution[0]}%` }}></div>
                                </div>
                                <span className="w-8 font-label-bold text-label-bold text-on-surface-variant text-right">{performance.ratingDistribution[0]}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-label-bold text-label-bold w-4">4</span>
                                <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${performance.ratingDistribution[1]}%` }}></div>
                                </div>
                                <span className="w-8 font-label-bold text-label-bold text-on-surface-variant text-right">{performance.ratingDistribution[1]}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-label-bold text-label-bold w-4">3</span>
                                <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${performance.ratingDistribution[2]}%` }}></div>
                                </div>
                                <span className="w-8 font-label-bold text-label-bold text-on-surface-variant text-right">{performance.ratingDistribution[2]}%</span>
                            </div>
                            <p className="text-label-sm text-on-surface-variant mt-2">Based on last 500 orders</p>
                        </div>
                    </div>

                    {/* Rider Level Progress Card */}
                    <div className="md:col-span-8 bg-surface-container border border-outline-variant rounded-xl p-stack-md flex flex-col">
                        <div className="flex justify-between items-start mb-stack-md">
                            <div>
                                <p className="font-label-bold text-label-bold text-on-surface-variant uppercase">Current Status</p>
                                <h3 className="font-headline-md text-headline-md text-on-surface">{performance.tier}</h3>
                                <p className="font-label-bold text-label-bold text-secondary mt-1">{performance.regionRank}</p>
                            </div>
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 hidden sm:block">social_leaderboard</span>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex justify-between font-label-bold text-label-bold mb-2">
                                <span>Bronze</span>
                                <span className="text-secondary">Silver</span>
                                <span className="text-on-surface-variant">Gold</span>
                            </div>
                            <div className="relative w-full h-4 bg-surface-container-highest rounded-full overflow-hidden">
                                <div className="absolute top-0 left-0 h-full bg-secondary transition-all duration-1000" style={{ width: `${performance.tierProgress}%` }}></div>
                            </div>
                            <p className="mt-4 font-body-md text-body-md text-on-surface-variant">
                                Complete <span className="text-on-background font-bold">{performance.deliveriesForNextTier} more deliveries</span> with a rating above 4.8 to reach <span className="text-primary font-bold">Gold Tier</span> benefits.
                            </p>
                        </div>
                        <div className="mt-6 grid grid-cols-3 gap-2">
                            <div className="bg-surface-container-low p-2 rounded-lg text-center hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                                <p className="text-label-sm text-on-surface-variant">Reward Points</p>
                                <p className="font-label-bold text-label-bold">{performance.rewardPoints}</p>
                            </div>
                            <div className="bg-surface-container-low p-2 rounded-lg text-center hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                                <p className="text-label-sm text-on-surface-variant">Boost Multiplier</p>
                                <p className="font-label-bold text-label-bold">{performance.boostMultiplier}x</p>
                            </div>
                            <div className="bg-surface-container-low p-2 rounded-lg text-center hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                                <p className="text-label-sm text-on-surface-variant">Insurance Tier</p>
                                <p className="font-label-bold text-label-bold">{performance.insuranceTier}</p>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics Tiles */}
                    <div className="md:col-span-3 bg-surface-container border border-outline-variant rounded-xl p-stack-md flex flex-col items-center accent-border-left hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                        <span className="material-symbols-outlined text-primary mb-2">schedule</span>
                        <span className="font-label-bold text-label-bold text-on-surface uppercase tracking-wider">On-Time Rate</span>
                        <div className="font-headline-lg text-headline-lg mt-unit text-primary">{performance.onTimeRate}</div>
                    </div>
                    <div className="md:col-span-3 bg-surface-container border border-outline-variant rounded-xl p-stack-md flex flex-col items-center accent-border-left hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                        <span className="material-symbols-outlined text-primary mb-2">check_circle</span>
                        <span className="font-label-bold text-label-bold text-on-surface uppercase tracking-wider">Acceptance</span>
                        <div className="font-headline-lg text-headline-lg mt-unit text-on-surface">{performance.acceptanceRate}</div>
                    </div>
                    <div className="md:col-span-3 bg-surface-container border border-outline-variant rounded-xl p-stack-md flex flex-col items-center accent-border-left hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                        <span className="material-symbols-outlined text-primary mb-2">speed</span>
                        <p className="text-label-sm text-on-surface-variant uppercase">Avg. Prep Wait</p>
                        <h4 className="font-headline-lg text-headline-lg text-on-background">{performance.avgPrepWait}</h4>
                        <p className="text-label-sm text-on-surface-variant">Optimal range</p>
                    </div>
                    <div className="md:col-span-3 bg-surface-container border border-outline-variant rounded-xl p-stack-md flex flex-col items-center accent-border-left-success hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                        <span className="material-symbols-outlined text-secondary mb-2">verified</span>
                        <p className="text-label-sm text-on-surface-variant uppercase">Completion Rate</p>
                        <h4 className="font-headline-lg text-headline-lg text-on-background">100%</h4>
                        <p className="text-label-sm text-secondary">Perfect streak!</p>
                    </div>

                    {/* Feedback Summaries */}
                    <div className="md:col-span-12 bg-surface-container border border-outline-variant rounded-xl p-stack-md overflow-hidden">
                        <div className="flex justify-between items-center mb-stack-md">
                            <h3 className="font-headline-md text-headline-md text-on-background">Recent Customer Feedback</h3>
                            <button className="text-primary font-label-bold text-label-bold hover:underline">View All</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                            {/* Feedback Item 1 */}
                            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 relative overflow-hidden hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex text-primary scale-75 origin-left">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    </div>
                                    <span className="text-label-sm text-on-surface-variant ml-auto">2 hours ago</span>
                                </div>
                                <p className="font-body-md text-body-md text-on-background italic">"Super fast delivery and handled the pizza with care. Everything was perfect!"</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-secondary text-sm">sentiment_very_satisfied</span>
                                    <span className="text-label-sm font-label-bold text-on-surface-variant">Tag: Fast & Professional</span>
                                </div>
                            </div>
                            
                            {/* Feedback Item 2 */}
                            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 relative overflow-hidden hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex text-primary scale-75 origin-left">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                    </div>
                                    <span className="text-label-sm text-on-surface-variant ml-auto">Yesterday</span>
                                </div>
                                <p className="font-body-md text-body-md text-on-background italic">"The rider was very polite and found my apartment easily even with the confusing entrance."</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-secondary text-sm">sentiment_satisfied</span>
                                    <span className="text-label-sm font-label-bold text-on-surface-variant">Tag: Great Navigator</span>
                                </div>
                            </div>

                            {/* Feedback Item 3 */}
                            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 relative overflow-hidden hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex text-primary scale-75 origin-left">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>star</span>
                                    </div>
                                    <span className="text-label-sm text-on-surface-variant ml-auto">Nov 12</span>
                                </div>
                                <p className="font-body-md text-body-md text-on-background italic">"Appreciate the delivery during the heavy rain. Everything was dry and warm!"</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-secondary text-sm">weather_hail</span>
                                    <span className="text-label-sm font-label-bold text-on-surface-variant">Tag: Reliable in Rain</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* BottomNavBar (Mobile Only) */}
            <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-4 pt-2 bg-surface border-t border-outline-variant lg:hidden">
                <Link to="/rider/dashboard" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:scale-95 duration-150">
                    <span className="material-symbols-outlined">home</span>
                    <span className="font-label-sm text-label-sm-mobile mt-1">Home</span>
                </Link>
                <Link to="/rider/active-deliveries" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:scale-95 duration-150">
                    <span className="material-symbols-outlined">list_alt</span>
                    <span className="font-label-sm text-label-sm-mobile mt-1">Tasks</span>
                </Link>
                <Link to="/rider/earnings" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 active:scale-95 duration-150">
                    <span className="material-symbols-outlined">payments</span>
                    <span className="font-label-sm text-label-sm-mobile mt-1">Earnings</span>
                </Link>
                <Link to="/rider/ratings" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 scale-95 duration-150">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-label-sm text-label-sm-mobile mt-1">Ratings</span>
                </Link>
            </nav>
        </div>
    );
};

export default Ratings;
