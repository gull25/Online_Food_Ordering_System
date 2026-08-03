import React from 'react';
import { Link } from 'react-router-dom';

const RiderSidebar = ({ activeTab }) => {
    return (
        <aside className="fixed left-0 top-0 h-full w-64 hidden lg:flex flex-col bg-surface border-r border-outline-variant z-40 py-6 pt-20">
            <div className="px-6 mb-8">
                <h2 className="font-inter text-xl font-semibold leading-7 font-bold text-primary">Rider Dashboard</h2>
                <p className="text-label-bold font-label-bold text-on-surface-variant opacity-60">Utility Logistics</p>
            </div>
            <nav className="flex-grow flex flex-col px-3 gap-1">
                <Link to="/rider/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform active:scale-95 ${activeTab === 'dashboard' ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-high' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                    <span className="material-symbols-outlined" style={activeTab === 'dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
                    <span className="font-inter text-xs font-bold leading-4">Overview</span>
                </Link>
                <Link to="/rider/active-deliveries" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform active:scale-95 ${activeTab === 'active-deliveries' ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-high' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                    <span className="material-symbols-outlined" style={activeTab === 'active-deliveries' ? { fontVariationSettings: "'FILL' 1" } : {}}>local_shipping</span>
                    <span className="font-inter text-xs font-bold leading-4">Active Deliveries</span>
                </Link>
                <Link to="/rider/earnings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform active:scale-95 ${activeTab === 'earnings' ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-high' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                    <span className="material-symbols-outlined" style={activeTab === 'earnings' ? { fontVariationSettings: "'FILL' 1" } : {}}>payments</span>
                    <span className="font-inter text-xs font-bold leading-4">Earnings</span>
                </Link>
                <Link to="/rider/ratings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-transform active:scale-95 ${activeTab === 'ratings' ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-high' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                    <span className="material-symbols-outlined" style={activeTab === 'ratings' ? { fontVariationSettings: "'FILL' 1" } : {}}>star</span>
                    <span className="font-inter text-xs font-bold leading-4">Ratings</span>
                </Link>
                <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95" href="#">
                    <span className="material-symbols-outlined">settings</span>
                    <span className="font-inter text-xs font-bold leading-4">Settings</span>
                </a>
            </nav>
            <div className="px-3 border-t border-outline-variant pt-4">
                <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-transform active:scale-95" href="#">
                    <span className="material-symbols-outlined">help</span>
                    <span className="font-inter text-xs font-bold leading-4">Help Center</span>
                </a>
            </div>
        </aside>
    );
};

export default RiderSidebar;
