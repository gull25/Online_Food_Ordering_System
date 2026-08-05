import React from 'react';
import { Link } from 'react-router-dom';

const RiderBottomNav = ({ activeTab }) => {
    return (
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-outline-variant flex justify-around items-center px-2 pb-4 pt-2 lg:hidden shadow-lg">
            <Link to="/rider/dashboard" className={`flex flex-col items-center justify-center rounded-full px-4 py-1 transition-transform scale-95 duration-150 ${activeTab === 'dashboard' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant active:bg-surface-container-highest'}`}>
                <span className="material-symbols-outlined" style={activeTab === 'dashboard' ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
                <span className="font-inter text-[11px] font-medium leading-[14px] mt-1">Home</span>
            </Link>
            <Link to="/rider/active-deliveries" className={`flex flex-col items-center justify-center rounded-full px-4 py-1 transition-transform scale-95 duration-150 ${activeTab === 'active-deliveries' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant active:bg-surface-container-highest'}`}>
                <span className="material-symbols-outlined" style={activeTab === 'active-deliveries' ? { fontVariationSettings: "'FILL' 1" } : {}}>list_alt</span>
                <span className="font-inter text-[11px] font-medium leading-[14px] mt-1">Tasks</span>
            </Link>
            <Link to="/rider/earnings" className={`flex flex-col items-center justify-center rounded-full px-4 py-1 transition-transform scale-95 duration-150 ${activeTab === 'earnings' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant active:bg-surface-container-highest'}`}>
                <span className="material-symbols-outlined" style={activeTab === 'earnings' ? { fontVariationSettings: "'FILL' 1" } : {}}>payments</span>
                <span className="font-inter text-[11px] font-medium leading-[14px] mt-1">Earnings</span>
            </Link>
            <Link to="/rider/ratings" className={`flex flex-col items-center justify-center rounded-full px-4 py-1 transition-transform scale-95 duration-150 ${activeTab === 'ratings' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant active:bg-surface-container-highest'}`}>
                <span className="material-symbols-outlined" style={activeTab === 'ratings' ? { fontVariationSettings: "'FILL' 1" } : {}}>star</span>
                <span className="font-inter text-[11px] font-medium leading-[14px] mt-1">Ratings</span>
            </Link>
        </nav>
    );
};

export default RiderBottomNav;
