import React from 'react';
import Icon from '../common/Icon';
import ThemeToggle from '../common/ThemeToggle';
import RiderProfileDropdown from './RiderProfileDropdown';
import { useDispatch } from 'react-redux';
import { updateRiderStatusThunk } from '../../redux/riderSlice';

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
                <span className="font-h3 text-h3 font-bold text-primary">Foodora Rider</span>
            </div>
            <div className="flex items-center gap-4">
                {showStatusToggle && profile && (
                    <div className="hidden md:flex items-center gap-2 bg-surface-container rounded-full px-4 py-1.5 border border-outline-variant">
                        {/* The online dot used `text-secondary`, which is a grey
                            in the light theme — so "Available" never actually
                            read as green. Semantic success tracks both themes. */}
                        <Icon name="fiber_manual_record" className={`text-[16px] ${profile.status === 'Available' ? 'text-success' : 'text-on-surface-variant'}`} filled />
                        <span className="font-inter text-xs font-bold leading-4 text-on-surface">
                            {profile.status === 'Available' ? 'ONLINE' : 'OFFLINE'}
                        </span>
                        <button
                            onClick={handleGoOnline}
                            role="switch"
                            aria-checked={profile.status === 'Available'}
                            aria-label={profile.status === 'Available' ? 'Go offline' : 'Go online'}
                            className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${profile.status === 'Available' ? 'bg-success' : 'bg-outline'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-surface-container-lowest rounded-full shadow transition-all duration-300 ${profile.status === 'Available' ? 'right-0.5' : 'left-0.5'}`}></div>
                        </button>
                    </div>
                )}
                <ThemeToggle />

                <RiderProfileDropdown />
            </div>
        </header>
    );
};

export default RiderHeader;
