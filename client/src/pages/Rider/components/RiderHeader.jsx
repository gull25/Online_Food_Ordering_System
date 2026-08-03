import React from 'react';
import ThemeToggle from '../../../components/common/ThemeToggle';
import RiderProfileDropdown from './RiderProfileDropdown';
import { useDispatch } from 'react-redux';
import { updateRiderStatusThunk } from '../../../features/rider/riderSlice';

const RiderHeader = ({ profile, showStatusToggle = false }) => {
    const dispatch = useDispatch();

    const handleGoOnline = () => {
        if (!profile) return;
        const newStatus = profile.status === 'Available' ? 'Offline' : 'Available';
        dispatch(updateRiderStatusThunk(newStatus));
    };

    return (
        <header className={`fixed top-0 w-full z-50 bg-background border-b border-outline-variant flex justify-between items-center px-4 py-3 ${!showStatusToggle ? 'lg:hidden' : ''}`}>
            <div className="flex items-center gap-2">
                <span className="font-inter text-xl font-semibold leading-7 font-bold text-primary">Foodora Rider</span>
            </div>
            <div className="flex items-center gap-4">
                {showStatusToggle && profile && (
                    <div className="hidden md:flex items-center gap-2 bg-surface-container rounded-full px-4 py-1.5 border border-outline-variant">
                        <span className={`material-symbols-outlined ${profile.status === 'Available' ? 'text-secondary' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            fiber_manual_record
                        </span>
                        <span className="font-inter text-xs font-bold leading-4 text-on-surface">
                            {profile.status === 'Available' ? 'GO OFFLINE' : 'GO ONLINE'}
                        </span>
                        <button 
                            onClick={handleGoOnline}
                            className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${profile.status === 'Available' ? 'bg-secondary-container' : 'bg-outline'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${profile.status === 'Available' ? 'right-0.5' : 'left-0.5'}`}></div>
                        </button>
                    </div>
                )}
                <ThemeToggle />
                <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors duration-200">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <RiderProfileDropdown />
            </div>
        </header>
    );
};

export default RiderHeader;
