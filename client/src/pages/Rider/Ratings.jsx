import React, { useEffect } from 'react';
import RiderBottomNav from './components/RiderBottomNav';
import RiderHeader from './components/RiderHeader';
import RiderSidebar from './components/RiderSidebar';
import RiderProfileDropdown from './components/RiderProfileDropdown';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPerformanceThunk } from '../../features/rider/riderSlice';

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
        <div className="font-inter bg-background text-on-background min-h-screen">
            <RiderHeader />

            <RiderSidebar activeTab="ratings" />

            {/* Main Content Canvas */}
            <main className="pt-20 lg:pt-8 pb-24 lg:ml-64 lg:px-8 px-4">
                {/* Header Section */}
                <div className="mb-stack-lg">
                    <h2 className="font-inter text-2xl font-semibold leading-8 text-on-background mb-1">Performance & Ratings</h2>
                    <p className="font-inter text-sm font-normal leading-5 text-on-surface-variant">Your journey as a top-tier rider. Keep it up!</p>
                </div>

                {/* Grid Layout: Bento-style */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Overall Rating Card */}
                    <div className="md:col-span-4 bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center text-center">
                        <p className="font-inter text-xs font-bold leading-4 text-on-surface-variant uppercase mb-2">Overall Rating</p>
                        <div className="font-inter text-[40px] font-bold leading-[48px] tracking-tight text-primary flex items-center justify-center gap-2">
                            {performance.overallRating}
                            <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        </div>
                        <div className="w-full space-y-2 mt-4">
                            <div className="flex items-center gap-2">
                                <span className="font-inter text-xs font-bold leading-4 w-4">5</span>
                                <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${performance.ratingDistribution[0]}%` }}></div>
                                </div>
                                <span className="w-8 font-inter text-xs font-bold leading-4 text-on-surface-variant text-right">{performance.ratingDistribution[0]}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-inter text-xs font-bold leading-4 w-4">4</span>
                                <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${performance.ratingDistribution[1]}%` }}></div>
                                </div>
                                <span className="w-8 font-inter text-xs font-bold leading-4 text-on-surface-variant text-right">{performance.ratingDistribution[1]}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-inter text-xs font-bold leading-4 w-4">3</span>
                                <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: `${performance.ratingDistribution[2]}%` }}></div>
                                </div>
                                <span className="w-8 font-inter text-xs font-bold leading-4 text-on-surface-variant text-right">{performance.ratingDistribution[2]}%</span>
                            </div>
                            <p className="text-label-sm text-on-surface-variant mt-2">Based on last 500 orders</p>
                        </div>
                    </div>

                    {/* Rider Level Progress Card */}
                    <div className="md:col-span-8 bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col">
                        <div className="flex justify-between items-start mb-stack-md">
                            <div>
                                <p className="font-inter text-xs font-bold leading-4 text-on-surface-variant uppercase">Current Status</p>
                                <h3 className="font-inter text-xl font-semibold leading-7 text-on-surface">{performance.tier}</h3>
                                <p className="font-inter text-xs font-bold leading-4 text-secondary mt-1">{performance.regionRank}</p>
                            </div>
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 hidden sm:block">social_leaderboard</span>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex justify-between font-inter text-xs font-bold leading-4 mb-2">
                                <span>Bronze</span>
                                <span className="text-secondary">Silver</span>
                                <span className="text-on-surface-variant">Gold</span>
                            </div>
                            <div className="relative w-full h-4 bg-surface-container-highest rounded-full overflow-hidden">
                                <div className="absolute top-0 left-0 h-full bg-secondary transition-all duration-1000" style={{ width: `${performance.tierProgress}%` }}></div>
                            </div>
                            <p className="mt-4 font-inter text-sm font-normal leading-5 text-on-surface-variant">
                                Complete <span className="text-on-background font-bold">{performance.deliveriesForNextTier} more deliveries</span> with a rating above 4.8 to reach <span className="text-primary font-bold">Gold Tier</span> benefits.
                            </p>
                        </div>
                        <div className="mt-6 grid grid-cols-3 gap-2">
                            <div className="bg-surface-container-low p-2 rounded-lg text-center hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                                <p className="text-label-sm text-on-surface-variant">Reward Points</p>
                                <p className="font-inter text-xs font-bold leading-4">{performance.rewardPoints}</p>
                            </div>
                            <div className="bg-surface-container-low p-2 rounded-lg text-center hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                                <p className="text-label-sm text-on-surface-variant">Boost Multiplier</p>
                                <p className="font-inter text-xs font-bold leading-4">{performance.boostMultiplier}x</p>
                            </div>
                            <div className="bg-surface-container-low p-2 rounded-lg text-center hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                                <p className="text-label-sm text-on-surface-variant">Insurance Tier</p>
                                <p className="font-inter text-xs font-bold leading-4">{performance.insuranceTier}</p>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics Tiles */}
                    <div className="md:col-span-3 bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col items-center border-l-4 border-l-[#ff5a1f] hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                        <span className="material-symbols-outlined text-primary mb-2">schedule</span>
                        <span className="font-inter text-xs font-bold leading-4 text-on-surface uppercase tracking-wider">On-Time Rate</span>
                        <div className="font-inter text-2xl font-semibold leading-8 mt-unit text-primary">{performance.onTimeRate}</div>
                    </div>
                    <div className="md:col-span-3 bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col items-center border-l-4 border-l-[#ff5a1f] hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                        <span className="material-symbols-outlined text-primary mb-2">check_circle</span>
                        <span className="font-inter text-xs font-bold leading-4 text-on-surface uppercase tracking-wider">Acceptance</span>
                        <div className="font-inter text-2xl font-semibold leading-8 mt-unit text-on-surface">{performance.acceptanceRate}</div>
                    </div>
                    <div className="md:col-span-3 bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col items-center border-l-4 border-l-[#ff5a1f] hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                        <span className="material-symbols-outlined text-primary mb-2">speed</span>
                        <p className="text-label-sm text-on-surface-variant uppercase">Avg. Prep Wait</p>
                        <h4 className="font-inter text-2xl font-semibold leading-8 text-on-background">{performance.avgPrepWait}</h4>
                        <p className="text-label-sm text-on-surface-variant">Optimal range</p>
                    </div>
                    <div className="md:col-span-3 bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col items-center border-l-4 border-l-[#06bb63] hover:-translate-y-0.5 hover:duration-200 hover:ease-out transition-transform">
                        <span className="material-symbols-outlined text-secondary mb-2">verified</span>
                        <p className="text-label-sm text-on-surface-variant uppercase">Completion Rate</p>
                        <h4 className="font-inter text-2xl font-semibold leading-8 text-on-background">100%</h4>
                        <p className="text-label-sm text-secondary">Perfect streak!</p>
                    </div>

                    {/* Feedback Summaries */}
                    <div className="md:col-span-12 bg-surface-container border border-outline-variant rounded-xl p-4 overflow-hidden">
                        <div className="flex justify-between items-center mb-stack-md">
                            <h3 className="font-inter text-xl font-semibold leading-7 text-on-background">Recent Customer Feedback</h3>
                            <button className="text-primary font-inter text-xs font-bold leading-4 hover:underline">View All</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                                <p className="font-inter text-sm font-normal leading-5 text-on-background italic">"Super fast delivery and handled the pizza with care. Everything was perfect!"</p>
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
                                <p className="font-inter text-sm font-normal leading-5 text-on-background italic">"The rider was very polite and found my apartment easily even with the confusing entrance."</p>
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
                                <p className="font-inter text-sm font-normal leading-5 text-on-background italic">"Appreciate the delivery during the heavy rain. Everything was dry and warm!"</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-secondary text-sm">weather_hail</span>
                                    <span className="text-label-sm font-label-bold text-on-surface-variant">Tag: Reliable in Rain</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <RiderBottomNav activeTab="ratings" />
        </div>
    );
};

export default Ratings;
