import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRiderProfileThunk } from '../../redux/riderSlice';
import RiderSidebar from './RiderSidebar';
import RiderHeader from './RiderHeader';
import RiderBottomNav from './RiderBottomNav';

const RiderLayout = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const { profile } = useSelector((state) => state.rider);

    useEffect(() => {
        if (!profile) {
            dispatch(fetchRiderProfileThunk());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    // Determine active tab based on path
    const path = location.pathname;
    let activeTab = 'dashboard';
    if (path.includes('active-deliveries')) activeTab = 'active-deliveries';
    else if (path.includes('earnings')) activeTab = 'earnings';

    return (
        <div className="font-inter min-h-screen bg-background text-on-background overflow-x-hidden">
            <RiderSidebar activeTab={activeTab} />
            <RiderHeader profile={profile} showStatusToggle={true} />

            {/* Bottom padding clears the mobile nav bar; lg drops it since the
                sidebar takes over there. */}
            <main id="main-content" tabIndex={-1} className="pt-[72px] lg:pl-64 pb-24 lg:pb-0 min-h-screen flex flex-col">
                <Outlet />
            </main>

            <RiderBottomNav />
        </div>
    );
};

export default RiderLayout;
